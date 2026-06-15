// Those vite runner related imports had to be relative.
import { parseEnv } from '../../shared/src/environment/env'
import { AppBrowserEnvSchema, AppBuildEnvSchema } from './env.schema'

export const browserEnv = parseEnv(AppBrowserEnvSchema, {
  SWAPI_BUILD_LEVEL: process.env['SWAPI_BUILD_LEVEL'],
  SWAPI_LOCAL_E2E: process.env['SWAPI_LOCAL_E2E'],
  SWAPI_LOG_LEVEL: process.env['SWAPI_LOG_LEVEL'],
  SWAPI_TARGET_ENVIRONMENT: process.env['SWAPI_TARGET_ENVIRONMENT'],
  SWAPI_USE_MOCK: process.env['SWAPI_USE_MOCK'],
})

export const buildEnv = parseEnv(AppBuildEnvSchema, {
  SWAPI_BUILD_LEVEL: process.env['SWAPI_BUILD_LEVEL'],
  SWAPI_CLIENT_PUBLIC_BASE_PATH: process.env['SWAPI_CLIENT_PUBLIC_BASE_PATH'],
  SWAPI_CLIENT_SERVER_PORT_DEV: process.env['SWAPI_CLIENT_SERVER_PORT_DEV'],
  SWAPI_CLIENT_SERVER_PORT_PREVIEW: process.env['SWAPI_CLIENT_SERVER_PORT_PREVIEW'],
  SWAPI_LOCAL_E2E: process.env['SWAPI_LOCAL_E2E'],
  SWAPI_LOG_LEVEL: process.env['SWAPI_LOG_LEVEL'],
  SWAPI_MINIFY: process.env['SWAPI_MINIFY'],
  SWAPI_SOURCE_MODE: process.env['SWAPI_SOURCE_MODE'],
  SWAPI_TARGET_ENVIRONMENT: process.env['SWAPI_TARGET_ENVIRONMENT'],
  SWAPI_VITE_SOURCE_MAPS: process.env['SWAPI_VITE_SOURCE_MAPS'],
})
