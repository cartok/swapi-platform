import { Type } from '@sinclair/typebox'
import {
  BuildSourcemapSchema,
  CommonEnvSchema,
  parseEnv,
  RunModeSchema,
} from '@swapi/shared/environment/env'

const NodeEnvSchema = Type.Union([
  Type.Literal('development'),
  Type.Literal('production'),
])

const AppServerEnvSchema = Type.Intersect(
  [
    CommonEnvSchema,
    Type.Object({
      NODE_ENV: Type.Readonly(NodeEnvSchema),
      SWAPI_ALLOWED_HOSTS: Type.Readonly(Type.String({ minLength: 1 })),
      SWAPI_BUILD_MINIFY: Type.Readonly(Type.Boolean()),
      SWAPI_BUILD_SOURCEMAP: Type.Readonly(BuildSourcemapSchema),
      SWAPI_RUN_MODE: Type.Readonly(RunModeSchema),
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
    NODE_ENV: process.env.NODE_ENV,
    SWAPI_ALLOWED_HOSTS: process.env['SWAPI_ALLOWED_HOSTS'],
    SWAPI_BUILD_MINIFY: process.env['SWAPI_BUILD_MINIFY'],
    SWAPI_BUILD_SOURCEMAP: process.env['SWAPI_BUILD_SOURCEMAP'],
    SWAPI_LOG_LEVEL: process.env['SWAPI_LOG_LEVEL'],
    SWAPI_PROFILE: process.env['SWAPI_PROFILE'],
    SWAPI_RUN_MODE: process.env['SWAPI_RUN_MODE'],
    SWAPI_SERVER_HOST_INTERNAL: process.env['SWAPI_SERVER_HOST_INTERNAL'],
    SWAPI_SERVER_HOST: process.env['SWAPI_SERVER_HOST'],
    SWAPI_SERVER_PORT: process.env['SWAPI_SERVER_PORT'],
    SWAPI_TARGET: process.env['SWAPI_TARGET'],
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
