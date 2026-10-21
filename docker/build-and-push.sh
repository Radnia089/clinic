#!/usr/bin/env bash
# Builds the production image and pushes it to the registry.
#
# Usage:
#   APP_IMAGE=registry.hamdocker.ir/amintvk/tandis-clinic \
#   NEXT_PUBLIC_APP_URL=https://tandisclinicyazd.ir \
#   docker/build-and-push.sh prod
#
# Optional env:
#   PLATFORM      target platform (default: linux/amd64)
#   NODE_IMAGE    override Node base image (e.g. a Docker Hub mirror)
#   NPM_REGISTRY  override npm registry
#   PUSH=false    build only, do not push
set -euo pipefail

cd "$(dirname "$0")/.."

# .git is excluded from the build context; skip BuildKit's git provenance probe.
export BUILDX_GIT_INFO=false

: "${APP_IMAGE:?Set APP_IMAGE, e.g. registry.hamdocker.ir/amintvk/tandis-clinic}"
: "${NEXT_PUBLIC_APP_URL:?Set NEXT_PUBLIC_APP_URL, e.g. https://tandisclinicyazd.ir}"

VERSION="${1:-prod}"
GIT_SHA="$(git rev-parse --short HEAD 2>/dev/null || echo unknown)"
PLATFORM="${PLATFORM:-linux/amd64}"
PUSH="${PUSH:-true}"
BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
IMAGE_REF="${APP_IMAGE}:${VERSION}"

build_args=(
  --platform "$PLATFORM"
  --build-arg "NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}"
  --build-arg "APP_VERSION=${VERSION}"
  --build-arg "GIT_SHA=${GIT_SHA}"
  --build-arg "BUILD_DATE=${BUILD_DATE}"
)
[[ -n "${NODE_IMAGE:-}" ]] && build_args+=(--build-arg "NODE_IMAGE=${NODE_IMAGE}")
[[ -n "${NPM_REGISTRY:-}" ]] && build_args+=(--build-arg "NPM_REGISTRY=${NPM_REGISTRY}")

echo "==> Building ${IMAGE_REF} (${PLATFORM})"
docker build "${build_args[@]}" -t "${IMAGE_REF}" .

if [[ "$PUSH" == "true" ]]; then
  echo "==> Pushing ${IMAGE_REF}"
  docker push "${IMAGE_REF}"
  echo "==> Done. On the server: keep APP_TAG=${VERSION} in .env, then 'docker compose pull && docker compose up -d'."
fi
