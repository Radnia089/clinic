#!/bin/sh
set -eu

log() {
  printf '[entrypoint] %s\n' "$*"
}

for dir in /app/.data /app/public/uploads; do
  mkdir -p "$dir"
  if [ ! -w "$dir" ]; then
    log "ERROR: $dir is not writable by uid $(id -u). Fix volume ownership: chown -R $(id -u):$(id -g) <volume path>"
    exit 1
  fi
done

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  log "Applying database migrations..."
  (cd /app/migrate && ./node_modules/.bin/prisma migrate deploy --config prisma.config.ts)
  log "Migrations applied."
else
  log "RUN_MIGRATIONS=false, skipping migrations."
fi

# The SMS reminder scheduler starts lazily on the first /api/reminders call.
# Trigger it once after boot so reminders keep flowing after a restart.
if [ "${REMINDER_SCHEDULER_AUTOSTART:-true}" = "true" ]; then
  node /usr/local/lib/start-reminders.mjs &
fi

log "Starting: $*"
exec "$@"
