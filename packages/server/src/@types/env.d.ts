import type { AppServerEnv } from '#internal/env'

declare global {
  const NODE_ENV: AppServerEnv['NODE_ENV']
  const SWAPI_BUILD_LEVEL: AppServerEnv['SWAPI_BUILD_LEVEL']
  const SWAPI_GIT_COMMIT_SHA: AppServerEnv['SWAPI_GIT_COMMIT_SHA']
  const SWAPI_LOCAL_E2E: AppServerEnv['SWAPI_LOCAL_E2E']
  const SWAPI_TARGET_ENVIRONMENT: AppServerEnv['SWAPI_TARGET_ENVIRONMENT']
}
