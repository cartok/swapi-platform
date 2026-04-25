import type { AppBrowserEnv } from './env.schema'

declare global {
  const SWAPI_LOG_LEVEL: AppBrowserEnv['SWAPI_LOG_LEVEL']
  const SWAPI_PROFILE: AppBrowserEnv['SWAPI_PROFILE']
  const SWAPI_TARGET: AppBrowserEnv['SWAPI_TARGET']
  const VITE_MODE: 'development' | 'production'
}
