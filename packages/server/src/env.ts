import type { Static } from '@sinclair/typebox'
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
      SWAPI_FLY_CHECK_ALIFE_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_CHECK_ERRORS_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_CHECK_SSR_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_KILL_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_REQUEST_HARD_LIMIT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_REQUEST_SOFT_LIMIT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_SERVICE_CHECK_READY_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
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

const AppServerSecretEnvSchema = Type.Object({
  SWAPI_SECRET_HEALTH_CHECK_TOKEN: Type.String({ minLength: 43, maxLength: 44 }),
})

export const secretEnv = parseEnv(
  AppServerSecretEnvSchema,
  {
    SWAPI_SECRET_HEALTH_CHECK_TOKEN: process.env['SWAPI_SECRET_HEALTH_CHECK_TOKEN'],
  },
  { secret: true },
)

export const env = parseEnv(AppServerEnvSchema, {
  NODE_ENV: process.env.NODE_ENV,
  SWAPI_ALLOWED_HOSTS: process.env['SWAPI_ALLOWED_HOSTS'],
  SWAPI_BUILD_MINIFY: process.env['SWAPI_BUILD_MINIFY'],
  SWAPI_BUILD_SOURCEMAP: process.env['SWAPI_BUILD_SOURCEMAP'],
  SWAPI_FLY_CHECK_ALIFE_TIMEOUT: process.env['SWAPI_FLY_CHECK_ALIFE_TIMEOUT'],
  SWAPI_FLY_CHECK_ERRORS_TIMEOUT: process.env['SWAPI_FLY_CHECK_ERRORS_TIMEOUT'],
  SWAPI_FLY_CHECK_SSR_TIMEOUT: process.env['SWAPI_FLY_CHECK_SSR_TIMEOUT'],
  SWAPI_FLY_KILL_TIMEOUT: process.env['SWAPI_FLY_KILL_TIMEOUT'],
  SWAPI_FLY_REQUEST_HARD_LIMIT: process.env['SWAPI_FLY_REQUEST_HARD_LIMIT'],
  SWAPI_FLY_REQUEST_SOFT_LIMIT: process.env['SWAPI_FLY_REQUEST_SOFT_LIMIT'],
  SWAPI_FLY_SERVICE_CHECK_READY_TIMEOUT:
    process.env['SWAPI_FLY_SERVICE_CHECK_READY_TIMEOUT'],
  SWAPI_LOG_LEVEL: process.env['SWAPI_LOG_LEVEL'],
  SWAPI_PROFILE: process.env['SWAPI_PROFILE'],
  SWAPI_RUN_MODE: process.env['SWAPI_RUN_MODE'],
  SWAPI_SERVER_HOST_INTERNAL: process.env['SWAPI_SERVER_HOST_INTERNAL'],
  SWAPI_SERVER_HOST: process.env['SWAPI_SERVER_HOST'],
  SWAPI_SERVER_PORT: process.env['SWAPI_SERVER_PORT'],
  SWAPI_TARGET: process.env['SWAPI_TARGET'],
})

export type AppServerEnv = Static<typeof AppServerEnvSchema>

export const GLOBAL_NODE_ENV = typeof NODE_ENV === 'undefined' ? env.NODE_ENV : NODE_ENV
export const GLOBAL_SWAPI_PROFILE =
  typeof SWAPI_PROFILE === 'undefined' ? env.SWAPI_PROFILE : SWAPI_PROFILE
export const GLOBAL_SWAPI_RUN_MODE =
  typeof SWAPI_RUN_MODE === 'undefined' ? env.SWAPI_RUN_MODE : SWAPI_RUN_MODE
export const GLOBAL_SWAPI_TARGET =
  typeof SWAPI_TARGET === 'undefined' ? env.SWAPI_TARGET : SWAPI_TARGET

const parsedAllowedHosts = env.SWAPI_ALLOWED_HOSTS.split(',')
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean)

if (parsedAllowedHosts.length === 0) {
  throw new Error('SWAPI_ALLOWED_HOSTS must contain at least one hostname.')
}

export const allowedHosts = Object.freeze([...new Set(parsedAllowedHosts)])
