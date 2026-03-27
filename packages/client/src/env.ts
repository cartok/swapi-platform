import { parseEnv } from '../../shared/src/environment/env'
import { AppBrowserEnvSchema } from './env.schema'

export const env = parseEnv(
  {
    SWAPI_DEV_TOOLS: process.env['SWAPI_DEV_TOOLS'],
    SWAPI_LOG_LEVEL: process.env['SWAPI_LOG_LEVEL'],
    SWAPI_OUTPUT_MODE: process.env['SWAPI_OUTPUT_MODE'],
    SWAPI_TARGET: process.env['SWAPI_TARGET'],
  },
  AppBrowserEnvSchema,
)
