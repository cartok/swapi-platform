import type { AppServerEnv } from '#internal/env'

declare global {
  const NODE_ENV: AppServerEnv['NODE_ENV']
  const SWAPI_PROFILE: AppServerEnv['SWAPI_PROFILE']
  const SWAPI_RUN_MODE: AppServerEnv['SWAPI_RUN_MODE']
  const SWAPI_TARGET: AppServerEnv['SWAPI_TARGET']
}
