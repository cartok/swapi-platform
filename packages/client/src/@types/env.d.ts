import type { AppBrowserEnv, ViteMode } from '@swapi/client/env.schema'

declare global {
  const SWAPI_BUILD_LEVEL: AppBrowserEnv['SWAPI_BUILD_LEVEL']
  const SWAPI_LOG_LEVEL: AppBrowserEnv['SWAPI_LOG_LEVEL']
  const SWAPI_TARGET_ENVIRONMENT: AppBrowserEnv['SWAPI_TARGET_ENVIRONMENT']
  const SWAPI_USE_MOCK: AppBrowserEnv['SWAPI_USE_MOCK']
  const VITE_MODE: ViteMode
}
