// These imports have to be relative for bundling.
import { parseEnv } from '../../shared/src/environment/env'
import { AppBrowserBuildEnvSchema, AppBuildEnvSchema } from './env.schema'

export const browserBuildEnv = parseEnv(AppBrowserBuildEnvSchema, {
  BUILD_LOG_LEVEL: process.env['BUILD_LOG_LEVEL'],
  BUILD_USE_SWAPI_MOCK: process.env['BUILD_USE_SWAPI_MOCK'],
})

export const buildEnv = parseEnv(AppBuildEnvSchema, {
  BUILD_MINIFY: process.env['BUILD_MINIFY'],
  BUILD_PROFILE: process.env['BUILD_PROFILE'],
  BUILD_PUBLIC_BASE_PATH: process.env['BUILD_PUBLIC_BASE_PATH'],
  BUILD_SERVER_PORT_DEV: process.env['BUILD_SERVER_PORT_DEV'],
  BUILD_SERVER_PORT_PREVIEW: process.env['BUILD_SERVER_PORT_PREVIEW'],
  BUILD_SOURCE_MAPS: process.env['BUILD_SOURCE_MAPS'],
  BUILD_SOURCE_MODE: process.env['BUILD_SOURCE_MODE'],
  BUILD_TARGET_ENVIRONMENT: process.env['BUILD_TARGET_ENVIRONMENT'],
  NODE_ENV: process.env['NODE_ENV'],
})
