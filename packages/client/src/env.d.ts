import type { Static } from '@sinclair/typebox'

import type { AppBrowserEnvSchema } from './env.schema'

type AppBrowserEnv = Static<typeof AppBrowserEnvSchema>

declare global {
  const SWAPI_OUTPUT_MODE: AppBrowserEnv['SWAPI_OUTPUT_MODE']
  const SWAPI_DEV_TOOLS: AppBrowserEnv['SWAPI_DEV_TOOLS']
  const SWAPI_LOG_LEVEL: AppBrowserEnv['SWAPI_LOG_LEVEL']
  const SWAPI_TARGET: AppBrowserEnv['SWAPI_TARGET']
}

export {}
