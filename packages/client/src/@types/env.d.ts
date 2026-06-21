import type { BrowserBuildEnv } from '@swapi/client/env.schema'

declare global {
  const BUILD_USE_SWAPI_MOCK: BrowserBuildEnv['BUILD_USE_SWAPI_MOCK']
  const BUILD_LOG_LEVEL: BrowserBuildEnv['BUILD_LOG_LEVEL']
}
