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
      NODE_ENV: Type.Readonly(OutputModeSchema),
      SWAPI_ALLOWED_HOSTS: Type.Readonly(Type.String({ minLength: 1 })),
      SWAPI_SERVER_HOST_INTERNAL: Type.Readonly(Type.String({ minLength: 1 })),
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
    NODE_ENV: process.env['NODE_ENV'],
    SWAPI_ALLOWED_HOSTS: process.env['SWAPI_ALLOWED_HOSTS'],
    SWAPI_SERVER_HOST_INTERNAL: process.env['SWAPI_SERVER_HOST_INTERNAL'],
    SWAPI_SERVER_HOST: process.env['SWAPI_SERVER_HOST'],
    SWAPI_SERVER_PORT: process.env['SWAPI_SERVER_PORT'],
  },
  AppServerEnvSchema,
)

const parsedAllowedHosts = env.SWAPI_ALLOWED_HOSTS.split(',')
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean)

if (parsedAllowedHosts.length === 0) {
  throw new Error('SWAPI_ALLOWED_HOSTS must contain at least one hostname.')
}

export const allowedHosts = Object.freeze([...new Set(parsedAllowedHosts)])
