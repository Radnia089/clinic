# Tandis clinic — single production image (Next.js app + runtime uploads).
#
# The base image is a build arg so a registry mirror can be used where Docker
# Hub is unreachable, e.g. --build-arg NODE_IMAGE=<mirror>/library/node:24-bookworm-slim

ARG NODE_IMAGE=node:24-bookworm-slim

# -----------------------------------------------------------------------------
# base: shared Node.js runtime settings
# -----------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS base
ARG NPM_REGISTRY=https://registry.npmjs.org/
# npm fetch settings tolerate flaky networks: retry each request with long backoff/timeouts.
ENV NEXT_TELEMETRY_DISABLED=1 \
    CHECKPOINT_DISABLE=1 \
    PRISMA_HIDE_UPDATE_MESSAGE=1 \
    npm_config_registry=${NPM_REGISTRY} \
    npm_config_fetch_retries=6 \
    npm_config_fetch_retry_factor=2 \
    npm_config_fetch_retry_mintimeout=15000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=600000 \
    npm_config_maxsockets=6 \
    npm_config_update_notifier=false \
    npm_config_fund=false \
    npm_config_audit=false
# OpenSSL must be present in every stage: Prisma picks the engine binary
# (e.g. debian-openssl-3.0.x) based on the OpenSSL it detects at install time.
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# -----------------------------------------------------------------------------
# deps: full dependency tree (including dev deps) for the build
# -----------------------------------------------------------------------------
FROM base AS deps
# Toolchain is a fallback for better-sqlite3 when no prebuilt binary matches.
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
# `postinstall` runs `prisma generate`, which needs the schema.
COPY prisma ./prisma
# Whole-install retries on top of per-request retries; the cache mount keeps
# already downloaded tarballs, so each attempt only fetches what is missing.
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    for attempt in 1 2 3 4; do \
      npm ci --prefer-offline && exit 0; \
      echo "npm ci failed (attempt ${attempt}/4), retrying in 20s..." >&2; \
      sleep 20; \
    done; \
    exit 1

# -----------------------------------------------------------------------------
# builder: compile the app, then strip dev dependencies
# -----------------------------------------------------------------------------
FROM base AS builder
# NEXT_PUBLIC_* values are inlined into the bundle at build time.
ARG NEXT_PUBLIC_APP_URL=""
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
 && npm prune --omit=dev \
 && rm -rf .next/cache \
 # Fail fast if the native SQLite driver cannot be loaded in this image.
 && node -e "new (require('better-sqlite3'))(':memory:').prepare('select 1').get()"

# -----------------------------------------------------------------------------
# migrator: standalone Prisma CLI pinned to the lockfile version
# -----------------------------------------------------------------------------
FROM base AS migrator
WORKDIR /app/migrate
COPY package-lock.json /tmp/package-lock.json
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    PRISMA_VERSION="$(node -p "require('/tmp/package-lock.json').packages['node_modules/prisma'].version")" \
 && npm init -y >/dev/null \
 && for attempt in 1 2 3 4; do \
      npm install --prefer-offline --omit=dev --no-package-lock "prisma@${PRISMA_VERSION}" && break; \
      [ "$attempt" = 4 ] && exit 1; \
      echo "npm install failed (attempt ${attempt}/4), retrying in 20s..." >&2; \
      sleep 20; \
    done \
 && rm -f package.json /tmp/package-lock.json \
 # Fail the build if the schema engine for this platform was not downloaded.
 && node -e " \
      const fs = require('fs'); \
      require('@prisma/get-platform').getBinaryTargetForCurrentPlatform().then((target) => { \
        const file = 'node_modules/@prisma/engines/schema-engine-' + target; \
        fs.accessSync(file, fs.constants.X_OK); \
        console.log('Prisma schema engine OK:', file); \
      }).catch((error) => { console.error(error.message); process.exit(1); });"
COPY prisma/schema.prisma ./prisma/schema.prisma
COPY prisma/migrations ./prisma/migrations
COPY docker/prisma.config.ts ./prisma.config.ts

# -----------------------------------------------------------------------------
# runner: application image
# -----------------------------------------------------------------------------
FROM base AS runner

ARG APP_VERSION=dev
ARG GIT_SHA=unknown
ARG BUILD_DATE=unknown
LABEL org.opencontainers.image.title="tandis-clinic" \
      org.opencontainers.image.description="Tandis diet clinic web application (Next.js + SQLite)" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_DATE}"

RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends tini \
 && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_URL=file:/app/.data/clinic.db \
    RUN_MIGRATIONS=true \
    REMINDER_SCHEDULER_AUTOSTART=true \
    APP_VERSION=${APP_VERSION}

COPY --from=builder --chown=node:node /app/package.json /app/next.config.ts ./
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
COPY --from=migrator --chown=node:node /app/migrate ./migrate
COPY --chown=node:node docker/server.mjs ./server.mjs
COPY --chmod=0755 docker/entrypoint.sh /usr/local/bin/docker-entrypoint
COPY --chmod=0644 docker/start-reminders.mjs /usr/local/lib/start-reminders.mjs

# Persistent state:
#   /app/.data           SQLite database, OTP store
#   /app/public/uploads  user uploads (served by server.mjs)
# /app/.next/cache must stay writable for image optimization.
RUN mkdir -p /app/.data /app/public/uploads /app/.next/cache \
 && chown -R node:node /app/.data /app/public/uploads /app/.next/cache

USER node
EXPOSE 3000
VOLUME ["/app/.data", "/app/public/uploads"]

# /api/auth/me answers 401 for anonymous callers: any status < 500 means the
# server is up and route handlers are executing.
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/auth/me').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"]

ENTRYPOINT ["/usr/bin/tini", "--", "docker-entrypoint"]
CMD ["node", "server.mjs"]
