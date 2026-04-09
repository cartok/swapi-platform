import type { AppBrowserEnv } from './env.schema'

declare global {
  const SWAPI_CLIENT_DEV_TOOLS: AppBrowserEnv['SWAPI_CLIENT_DEV_TOOLS']
  const SWAPI_LOG_LEVEL: AppBrowserEnv['SWAPI_LOG_LEVEL']
  const SWAPI_OUTPUT_MODE: AppBrowserEnv['SWAPI_OUTPUT_MODE']
  const SWAPI_TARGET: AppBrowserEnv['SWAPI_TARGET']
}

export {}
