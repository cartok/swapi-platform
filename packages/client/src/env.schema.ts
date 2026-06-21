import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'

// These imports have to be relative for bundling.
import {
  AppTargetEnvironmentSchema,
  LogLevelSchema,
  NodeEnvSchema,
  ProfileSchema,
  SourceModeSchema,
  ViteSourceMapsSchema,
} from '../../shared/src/environment/env.schema'

export const AppBuildEnvSchema = Type.Object({
  BUILD_MINIFY: Type.Readonly(Type.Boolean()),
  BUILD_PROFILE: Type.Readonly(ProfileSchema),
  BUILD_PUBLIC_BASE_PATH: Type.Readonly(Type.String({ minLength: 1, default: '/' })),
  BUILD_SERVER_PORT_DEV: Type.Readonly(Type.Optional(Type.Integer())),
  BUILD_SERVER_PORT_PREVIEW: Type.Readonly(Type.Optional(Type.Integer())),
  BUILD_SOURCE_MAPS: Type.Readonly(ViteSourceMapsSchema),
  BUILD_SOURCE_MODE: Type.Readonly(SourceModeSchema),
  BUILD_TARGET_ENVIRONMENT: Type.Readonly(AppTargetEnvironmentSchema),
  NODE_ENV: Type.Readonly(NodeEnvSchema),
})
export type AppBuildEnv = Static<typeof AppBuildEnvSchema>

// Those should later become updatable runtime vars / feature flags.
export const AppBrowserBuildEnvSchema = Type.Object({
  BUILD_LOG_LEVEL: Type.Readonly(LogLevelSchema),
  BUILD_USE_SWAPI_MOCK: Type.Readonly(Type.Boolean()),
})
export type AppBrowserBuildEnv = Static<typeof AppBrowserBuildEnvSchema>
