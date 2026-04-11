import { Type } from '@sinclair/typebox'
import {
  CommonEnvSchema,
  OutputModeSchema,
  parseCommonEnv,
  parseEnv,
} from '@swapi/shared/environment/env'

const AppServerEnvSchema = Type.Intersect(
  [
    CommonEnvSchema,
    Type.Object({
      NG_ALLOWED_HOSTS: Type.Readonly(Type.String({ minLength: 1 })),
      NODE_ENV: Type.Readonly(OutputModeSchema),
      SWAPI_SERVER_HOST: Type.Readonly(Type.String({ minLength: 1 })),
      SWAPI_SERVER_PORT: Type.Readonly(Type.Integer({ minimum: 49152, maximum: 65535 })),
    }),
  ],
  {
    unevaluatedProperties: false,
  },
)

export const env = parseEnv(
  {
    ...parseCommonEnv(),
    NG_ALLOWED_HOSTS: process.env['NG_ALLOWED_HOSTS'],
    NODE_ENV: process.env['NODE_ENV'],
    SWAPI_SERVER_HOST: process.env['SWAPI_SERVER_HOST'],
    SWAPI_SERVER_PORT: process.env['SWAPI_SERVER_PORT'],
  },
  AppServerEnvSchema,
)
