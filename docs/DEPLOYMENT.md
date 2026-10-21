# Deployment (Docker)

The app ships as a single image built from the root `Dockerfile`. It contains
the Next.js server, the Prisma CLI for migrations, and a small entry server
(`docker/server.mjs`) that also serves images uploaded at runtime: `next start`
only serves files that were already in `public/` when the server booted.

## Layout

```
Dockerfile                  multi-stage build (deps, builder, migrator, runner)
.dockerignore
docker/
  server.mjs                production entry: Next.js + /uploads file serving
  entrypoint.sh             volume checks, `prisma migrate deploy`, scheduler warm-up
  start-reminders.mjs       starts the SMS reminder scheduler after boot
  prisma.config.ts          Prisma config used for migrations inside the image
  build-and-push.sh         builds and pushes the image
deploy/
  docker-compose.yml        production stack (pull-only)
  .env.example              server configuration template
```

## 1. Build and push

### GitHub Actions (recommended)

Workflow: `.github/workflows/docker-publish.yml`

Runs on push to `main` / `master`, on tags `v*.*.*`, or via **Actions → Docker
Publish → Run workflow**.

In the GitHub repo:

**Secrets** (Settings → Secrets and variables → Actions → Secrets)

| Name | Example |
| --- | --- |
| `REGISTRY_USERNAME` | registry user |
| `REGISTRY_PASSWORD` | registry password / token |

**Variables** (Settings → Secrets and variables → Actions → Variables)

| Name | Example |
| --- | --- |
| `APP_IMAGE` | `registry.hamdocker.ir/amintvk/tandis-clinic` |
| `NEXT_PUBLIC_APP_URL` | `https://tandisclinicyazd.ir` |
| `REGISTRY_HOST` | `registry.hamdocker.ir` (optional; this is the default) |
| `NODE_IMAGE` | Docker Hub mirror for Node (optional) |
| `NPM_REGISTRY` | npm mirror URL (optional) |

Image tags:

| Trigger | Tag |
| --- | --- |
| Push to `main` / `master` | `prod` |
| Git tag `v1.2.3` | `1.2.3` and `prod` |
| Manual run | value you enter (default `prod`) |

On the server keep `APP_TAG=prod` and `docker compose pull` after each publish.

### Local script

```bash
docker login registry.hamdocker.ir

APP_IMAGE=registry.hamdocker.ir/amintvk/tandis-clinic \
NEXT_PUBLIC_APP_URL=https://tandisclinicyazd.ir \
docker/build-and-push.sh prod
```

`NEXT_PUBLIC_APP_URL` is inlined at build time (used in SMS links), so changing
it requires a rebuild.

If Docker Hub or npm is unreachable, point the build at mirrors:

```bash
NODE_IMAGE=<mirror>/library/node:24-bookworm-slim \
NPM_REGISTRY=<npm-mirror-url> \
APP_IMAGE=... NEXT_PUBLIC_APP_URL=... docker/build-and-push.sh 1.0.0
```

## 2. Deploy on the server

Copy only `deploy/docker-compose.yml` and `deploy/.env.example` to the server:

```bash
mkdir -p /opt/tandis-clinic && cd /opt/tandis-clinic
# copy docker-compose.yml and .env.example here
cp .env.example .env && chmod 600 .env   # set APP_TAG and SMS keys
docker login registry.hamdocker.ir
docker compose pull
docker compose up -d
docker compose ps        # the app should become "healthy"
docker compose logs -f app
```

On first boot the entrypoint creates the SQLite database, applies migrations,
and the app seeds default data and staff accounts (`admin` / `tandis`, password
`123456`). **Change both passwords immediately after the first login.**

### TLS

The container is published on plain HTTP (`PUBLISH_PORT`, default 80).
Terminate TLS in front of it, e.g. Cloudflare, or a host-level nginx/Caddy with
`PUBLISH_ADDR=127.0.0.1` and `PUBLISH_PORT=8080`.

## 3. Update / rollback

```bash
# After a new :prod push from CI (or set APP_TAG to a version tag to roll back):
docker compose pull && docker compose up -d
```

Migrations run automatically on start (`RUN_MIGRATIONS=true`). Prisma
migrations are forward-only, so take a backup before upgrading.

## 4. Persistent data and backups

| Volume | Mounted at | Contents |
| --- | --- | --- |
| `tandis-clinic-data` | `/app/.data` | SQLite database (`clinic.db`), OTP store |
| `tandis-clinic-uploads` | `/app/public/uploads` | Uploaded images |

Consistent online backup (uses SQLite's backup API, safe while the app runs):

```bash
ts=$(date +%F-%H%M)
docker compose exec -T app node -e "
  const db = new (require('better-sqlite3'))('/app/.data/clinic.db', { readonly: true });
  db.backup('/tmp/clinic-backup.db').then(() => console.log('ok'));
"
docker compose cp app:/tmp/clinic-backup.db ./clinic-$ts.db
docker run --rm -v tandis-clinic-uploads:/src:ro -v "$PWD":/dst alpine \
  tar czf /dst/uploads-$ts.tar.gz -C /src .
```

Restore:

```bash
docker compose stop app
docker run --rm -v tandis-clinic-data:/data -v "$PWD":/src alpine \
  sh -c 'cp /src/clinic-<ts>.db /data/clinic.db && rm -f /data/clinic.db-wal /data/clinic.db-shm && chown 1000:1000 /data/clinic.db'
docker run --rm -v tandis-clinic-uploads:/dst -v "$PWD":/src alpine \
  sh -c 'tar xzf /src/uploads-<ts>.tar.gz -C /dst && chown -R 1000:1000 /dst'
docker compose start app
```

## 5. Operational notes

- **Single replica only.** SQLite and the in-process reminder scheduler both
  assume exactly one app container. Do not scale `app`.
- **Hardening:** the container runs as non-root (`node`, uid 1000) under
  `tini`, with a read-only root filesystem, `no-new-privileges`, all Linux
  capabilities dropped, resource limits, and rotated JSON logs.
- **Health:** the app is healthy when its HTTP server answers.
- **Reminder scheduler:** it starts lazily inside the app; the entrypoint calls
  `/api/reminders` once after boot so reminders keep running after restarts.
  Disable with `REMINDER_SCHEDULER_AUTOSTART=false`.
- **Bind mounts instead of named volumes:** the directories must be owned by
  uid/gid `1000` (`chown -R 1000:1000 <dir>`); the entrypoint refuses to start
  otherwise.
