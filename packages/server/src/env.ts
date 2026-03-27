import { Type } from '@sinclair/typebox'
import { CommonEnvSchema, OutputMode, parseEnv } from '@swapi/shared/environment/env'

const AppServerEnvSchema = Type.Intersect(
  [
    CommonEnvSchema,
    Type.Object({
      NG_ALLOWED_HOSTS: Type.Readonly(Type.String({ minLength: 1 })),
      NODE_ENV: Type.Readonly(OutputMode),
      SWAPI_HOST: Type.Readonly(Type.String({ minLength: 1 })),
      SWAPI_PORT: Type.Readonly(Type.Integer({ minimum: 49152, maximum: 65535 })),
    }),
  ],
  {
    unevaluatedProperties: false,
  },
)

export const env = parseEnv(
  {
    NG_ALLOWED_HOSTS: process.env['NG_ALLOWED_HOSTS'],
    NODE_ENV: process.env['NODE_ENV'],
    SWAPI_HOST: process.env['SWAPI_HOST'],
    SWAPI_LOG_LEVEL: process.env['SWAPI_LOG_LEVEL'],
    SWAPI_OUTPUT_MODE: process.env['SWAPI_OUTPUT_MODE'],
    SWAPI_PORT: process.env['SWAPI_PORT'],
    SWAPI_TARGET: process.env['SWAPI_TARGET'],
  },
  AppServerEnvSchema,
)
