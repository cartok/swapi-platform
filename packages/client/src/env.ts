import { parseEnv } from '../../shared/src/environment/env'
import { AppBrowserEnvSchema, AppBuildEnvSchema } from './env.schema'

export const browserEnv = parseEnv(
  {
    SWAPI_CLIENT_DEV_TOOLS: process.env['SWAPI_CLIENT_DEV_TOOLS'],
    SWAPI_LOG_LEVEL: process.env['SWAPI_LOG_LEVEL'],
    SWAPI_OUTPUT_MODE: process.env['SWAPI_OUTPUT_MODE'],
    SWAPI_TARGET: process.env['SWAPI_TARGET'],
  },
  AppBrowserEnvSchema,
)

export const buildEnv = parseEnv(
  {
    SWAPI_CLIENT_DEV_SERVER_PORT: process.env['SWAPI_CLIENT_DEV_SERVER_PORT'],
    SWAPI_CLIENT_PREVIEW_SERVER_PORT: process.env['SWAPI_CLIENT_PREVIEW_SERVER_PORT'],
    SWAPI_CLIENT_PUBLIC_BASE_PATH: process.env['SWAPI_CLIENT_PUBLIC_BASE_PATH'],
  },
  AppBuildEnvSchema,
)
