import { Type } from '@sinclair/typebox'
import {
  AppTargetEnvironmentSchema,
  DynamicPortSchema,
  IsLocalEndToEndSchema,
  LogLevelSchema,
  NodeEnvSchema,
  ProfileSchema,
  RolldownSourceMapsSchema,
  SecretTokenSchema,
} from '@swapi/shared/environment/env.schema'

/**
 * Some of these variables should get moved to fly secrets to be changeable without rebuild.
 * It's not possible for the fly variables or for those that cause DCE.
 */
export const AppServerBuildEnvSchema = Type.Object({
  BUILD_FLY_CHECK_ALIFE_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
  BUILD_FLY_CHECK_ERRORS_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
  BUILD_FLY_CHECK_SSR_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
  BUILD_FLY_KILL_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
  BUILD_FLY_REQUEST_HARD_LIMIT: Type.Readonly(Type.Integer({ minimum: 1 })),
  BUILD_FLY_REQUEST_SOFT_LIMIT: Type.Readonly(Type.Integer({ minimum: 1 })),
  BUILD_FLY_SERVICE_CHECK_READY_TIMEOUT: Type.Readonly(Type.Integer({ minimum: 1 })),
  BUILD_GIT_COMMIT_SHA: Type.Readonly(Type.String({ minLength: 40, maxLength: 40 })),
  BUILD_MINIFY: Type.Readonly(Type.Boolean()),
  BUILD_PROFILE: Type.Readonly(ProfileSchema),
  BUILD_SOURCE_MAPS: Type.Readonly(RolldownSourceMapsSchema),
  BUILD_TARGET_ENVIRONMENT: Type.Readonly(AppTargetEnvironmentSchema),
  NODE_ENV: Type.Readonly(NodeEnvSchema),
})

export const AppServerRunEnvSchema = Type.Object({
  RUN_ALLOWED_HOSTS: Type.Readonly(Type.String({ minLength: 1 })),
  RUN_HOST_INTERNAL: Type.Readonly(Type.String({ minLength: 1 })),
  RUN_HOST: Type.Readonly(Type.String({ minLength: 1 })),
  RUN_IS_LOCAL_E2E: Type.Readonly(IsLocalEndToEndSchema),
  RUN_LOG_LEVEL: Type.Readonly(LogLevelSchema),
  RUN_PORT: Type.Readonly(DynamicPortSchema),
  RUN_USE_LOCAL_E2E_CACHE: Type.Readonly(IsLocalEndToEndSchema),
})

export const AppServerRunEnvSecretsSchema = Type.Object({
  SECRET_HEALTH_CHECK_TOKEN: Type.Optional(SecretTokenSchema),
  SECRET_SSG_RENDER_TOKEN: Type.Optional(SecretTokenSchema),
})
