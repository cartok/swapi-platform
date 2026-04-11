import { parseCommonEnv, parseEnv } from '../../shared/src/environment/env'
import { AppBrowserEnvSchema, AppBuildEnvSchema } from './env.schema'

export const browserEnv = parseEnv(
  {
    ...parseCommonEnv(),
  },
  AppBrowserEnvSchema,
)

export const buildEnv = parseEnv(
  {
    ...parseCommonEnv(),
    SWAPI_CLIENT_DEV_TOOLS: process.env['SWAPI_CLIENT_DEV_TOOLS'],
    SWAPI_CLIENT_PUBLIC_BASE_PATH: process.env['SWAPI_CLIENT_PUBLIC_BASE_PATH'],
    SWAPI_CLIENT_SERVER_PORT_DEV: process.env['SWAPI_CLIENT_SERVER_PORT_DEV'],
    SWAPI_CLIENT_SERVER_PORT_PREVIEW: process.env['SWAPI_CLIENT_SERVER_PORT_PREVIEW'],
  },
  AppBuildEnvSchema,
)
