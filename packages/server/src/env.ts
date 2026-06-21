import type { Static } from '@sinclair/typebox'
import {
  parseEnv,
  parseSecretEnv,
  validateRequiredSecretEnv,
} from '@swapi/shared/environment/env'

import {
  AppServerBuildEnvSchema,
  AppServerRunEnvSchema,
  AppServerRunEnvSecretsSchema,
} from './env.schema.js'

export const buildEnv = parseEnv(AppServerBuildEnvSchema, {
  BUILD_FLY_CHECK_ALIFE_TIMEOUT: process.env['BUILD_FLY_CHECK_ALIFE_TIMEOUT'],
  BUILD_FLY_CHECK_ERRORS_TIMEOUT: process.env['BUILD_FLY_CHECK_ERRORS_TIMEOUT'],
  BUILD_FLY_CHECK_SSR_TIMEOUT: process.env['BUILD_FLY_CHECK_SSR_TIMEOUT'],
  BUILD_FLY_KILL_TIMEOUT: process.env['BUILD_FLY_KILL_TIMEOUT'],
  BUILD_FLY_REQUEST_HARD_LIMIT: process.env['BUILD_FLY_REQUEST_HARD_LIMIT'],
  BUILD_FLY_REQUEST_SOFT_LIMIT: process.env['BUILD_FLY_REQUEST_SOFT_LIMIT'],
  BUILD_FLY_SERVICE_CHECK_READY_TIMEOUT:
    process.env['BUILD_FLY_SERVICE_CHECK_READY_TIMEOUT'],
  BUILD_GIT_COMMIT_SHA: process.env['BUILD_GIT_COMMIT_SHA'],
  BUILD_MINIFY: process.env['BUILD_MINIFY'],
  BUILD_PROFILE: process.env['BUILD_PROFILE'],
  BUILD_SOURCE_MAPS: process.env['BUILD_SOURCE_MAPS'],
  BUILD_TARGET_ENVIRONMENT: process.env['BUILD_TARGET_ENVIRONMENT'],
  NODE_ENV: process.env.NODE_ENV,
})
export type AppServerEnv = Static<typeof AppServerBuildEnvSchema>

export const runEnv = parseEnv(AppServerRunEnvSchema, {
  RUN_ALLOWED_HOSTS: process.env['RUN_ALLOWED_HOSTS'],
  RUN_HOST_INTERNAL: process.env['RUN_HOST_INTERNAL'],
  RUN_HOST: process.env['RUN_HOST'],
  RUN_IS_LOCAL_E2E: process.env['RUN_IS_LOCAL_E2E'],
  RUN_LOG_LEVEL: process.env['RUN_LOG_LEVEL'],
  RUN_PORT: process.env['RUN_PORT'],
  RUN_USE_LOCAL_E2E_CACHE: process.env['RUN_USE_LOCAL_E2E_CACHE'],
})

const parsedAllowedHosts = runEnv.RUN_ALLOWED_HOSTS.split(',')
  .map((x) => x.trim().toLowerCase())
  .filter(Boolean)

if (parsedAllowedHosts.length === 0) {
  throw new Error('RUN_ALLOWED_HOSTS must contain at least one hostname.')
}

export const allowedHosts = Object.freeze([...new Set(parsedAllowedHosts)])

export const secretEnv = parseSecretEnv(AppServerRunEnvSecretsSchema, {
  SECRET_HEALTH_CHECK_TOKEN: process.env['SECRET_HEALTH_CHECK_TOKEN'],
  SECRET_SSG_RENDER_TOKEN: process.env['SECRET_SSG_RENDER_TOKEN'],
})

export function validateRuntimeSecretEnv(): void {
  if (DCE_BUILD_TARGET_ENVIRONMENT === 'local') {
    return
  }

  validateRequiredSecretEnv(AppServerRunEnvSecretsSchema, secretEnv)
}

/**
 * About these DCE Variables:
 *
 * The environment variables that are globally made available through rolldown on build time
 * need a fallback for unbundled builds, which is why there are here referenced like that.
 * They are defined one by one in order to have a result that works for DCE.
 * Therefore any variable listed here must be used instead of the runtime variables in `env`.
 */
export const DCE_BUILD_GIT_COMMIT_SHA =
  typeof BUILD_GIT_COMMIT_SHA === 'undefined'
    ? buildEnv.BUILD_GIT_COMMIT_SHA
    : BUILD_GIT_COMMIT_SHA

export const DCE_BUILD_TARGET_ENVIRONMENT =
  typeof BUILD_TARGET_ENVIRONMENT === 'undefined'
    ? buildEnv.BUILD_TARGET_ENVIRONMENT
    : BUILD_TARGET_ENVIRONMENT
