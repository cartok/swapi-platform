import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import {
  CommonAppEnvSchema,
  CommonEnvSchema,
  DynamicPortSchema,
  parseEnv,
} from '@swapi/shared/environment/env'

const NodeEnvSchema = Type.Union([
  Type.Literal('development'),
  Type.Literal('production'),
])

const RolldownSourceMapsSchema = Type.Union([
  Type.Boolean(),
  Type.Literal('hidden'),
  Type.Literal('inline'),
])

const AppServerEnvSchema = Type.Intersect(
  [
    CommonAppEnvSchema,
    CommonEnvSchema,
    Type.Object({
      CI: Type.Readonly(Type.Boolean({ default: false })),
      NODE_ENV: Type.Readonly(NodeEnvSchema),
      SWAPI_ALLOWED_HOSTS: Type.Readonly(Type.String({ minLength: 1 })),
      SWAPI_FLY_CHECK_ALIFE_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_CHECK_ERRORS_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_CHECK_SSR_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_KILL_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_REQUEST_HARD_LIMIT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_REQUEST_SOFT_LIMIT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_FLY_SERVICE_CHECK_READY_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
      SWAPI_GIT_COMMIT_SHA: Type.Readonly(Type.String({ minLength: 40, maxLength: 40 })),
      SWAPI_MINIFY: Type.Readonly(Type.Boolean()),
      SWAPI_ROLLDOWN_SOURCE_MAPS: Type.Readonly(RolldownSourceMapsSchema),
      SWAPI_SERVER_HOST_INTERNAL: Type.Readonly(Type.String({ minLength: 1 })),
      SWAPI_SERVER_HOST: Type.Readonly(Type.String({ minLength: 1 })),
      SWAPI_APP_SERVER_PORT: Type.Readonly(DynamicPortSchema),
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
  CI: process.env['CI'],
  NODE_ENV: process.env.NODE_ENV,
  SWAPI_ALLOWED_HOSTS: process.env['SWAPI_ALLOWED_HOSTS'],
  SWAPI_BUILD_LEVEL: process.env['SWAPI_BUILD_LEVEL'],
  SWAPI_FLY_CHECK_ALIFE_TIMEOUT: process.env['SWAPI_FLY_CHECK_ALIFE_TIMEOUT'],
  SWAPI_FLY_CHECK_ERRORS_TIMEOUT: process.env['SWAPI_FLY_CHECK_ERRORS_TIMEOUT'],
  SWAPI_FLY_CHECK_SSR_TIMEOUT: process.env['SWAPI_FLY_CHECK_SSR_TIMEOUT'],
  SWAPI_FLY_KILL_TIMEOUT: process.env['SWAPI_FLY_KILL_TIMEOUT'],
  SWAPI_FLY_REQUEST_HARD_LIMIT: process.env['SWAPI_FLY_REQUEST_HARD_LIMIT'],
  SWAPI_FLY_REQUEST_SOFT_LIMIT: process.env['SWAPI_FLY_REQUEST_SOFT_LIMIT'],
  SWAPI_FLY_SERVICE_CHECK_READY_TIMEOUT:
    process.env['SWAPI_FLY_SERVICE_CHECK_READY_TIMEOUT'],
  SWAPI_GIT_COMMIT_SHA: process.env['SWAPI_GIT_COMMIT_SHA'],
  SWAPI_LOCAL_E2E: process.env['SWAPI_LOCAL_E2E'],
  SWAPI_LOG_LEVEL: process.env['SWAPI_LOG_LEVEL'],
  SWAPI_MINIFY: process.env['SWAPI_MINIFY'],
  SWAPI_ROLLDOWN_SOURCE_MAPS: process.env['SWAPI_ROLLDOWN_SOURCE_MAPS'],
  SWAPI_SERVER_HOST_INTERNAL: process.env['SWAPI_SERVER_HOST_INTERNAL'],
  SWAPI_SERVER_HOST: process.env['SWAPI_SERVER_HOST'],
  SWAPI_APP_SERVER_PORT: process.env['SWAPI_APP_SERVER_PORT'],
  SWAPI_TARGET_ENVIRONMENT: process.env['SWAPI_TARGET_ENVIRONMENT'],
})

export type AppServerEnv = Static<typeof AppServerEnvSchema>

const parsedAllowedHosts = env.SWAPI_ALLOWED_HOSTS.split(',')
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean)

if (parsedAllowedHosts.length === 0) {
  throw new Error('SWAPI_ALLOWED_HOSTS must contain at least one hostname.')
}

export const allowedHosts = Object.freeze([...new Set(parsedAllowedHosts)])

/**
 * About DCE Variables
 *
 * The environment variables that are globally made available through rolldown on build time
 * need a fallback for unbundled builds, which is why there are here referenced like that.
 * They are defined one by one in order to have a result that works for DCE.
 * Therefore any variable listed here must be used instead of the runtime variables in `env`.
 */

export const DCE_SWAPI_GIT_COMMIT_SHA =
  typeof SWAPI_GIT_COMMIT_SHA === 'undefined'
    ? env.SWAPI_GIT_COMMIT_SHA
    : SWAPI_GIT_COMMIT_SHA

export const DCE_SWAPI_TARGET_ENVIRONMENT =
  typeof SWAPI_TARGET_ENVIRONMENT === 'undefined'
    ? env.SWAPI_TARGET_ENVIRONMENT
    : SWAPI_TARGET_ENVIRONMENT

export const DCE_SWAPI_LOCAL_E2E =
  typeof SWAPI_LOCAL_E2E === 'undefined' ? env.SWAPI_LOCAL_E2E : SWAPI_LOCAL_E2E
