#!/usr/bin/env bash

set -euo pipefail

MY_BUILD_SECRET="super-secret-build-time-secret"
COMBINED_HASH=$({
  git rev-parse HEAD:bun.lock
  git rev-parse HEAD:package.json
  # TODO: exit code ist 0, sollte aber 1 sein
  git rev-parse HEAD:packages/server-gibts-nicht
  git rev-parse HEAD:packages/client
  git rev-parse HEAD:packages/shared
  git rev-parse HEAD:packages/hono
  echo "${MY_BUILD_SECRET}"
} | sha256sum | head -c 12)

echo "$COMBINED_HASH"
