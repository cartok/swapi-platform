import type { AppServerEnv } from '#internal/env'

declare global {
  const BUILD_GIT_COMMIT_SHA: AppServerEnv['BUILD_GIT_COMMIT_SHA']
  const BUILD_TARGET_ENVIRONMENT: AppServerEnv['BUILD_TARGET_ENVIRONMENT']
}
