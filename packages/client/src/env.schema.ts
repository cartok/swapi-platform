import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'

// Those vite runner related imports had to be relative.
import {
  BuildSourcemapSchema,
  CommonEnvSchema,
  RunModeSchema,
} from '../../shared/src/environment/env'

export const AppBrowserEnvSchema = CommonEnvSchema

export type AppBrowserEnv = Static<typeof AppBrowserEnvSchema>

export const AppBuildEnvSchema = Type.Intersect([
  CommonEnvSchema,
  Type.Object({
    SWAPI_BUILD_MINIFY: Type.Readonly(Type.Boolean()),
    SWAPI_BUILD_SOURCEMAP: Type.Readonly(BuildSourcemapSchema),
    SWAPI_CLIENT_DEV_TOOLS: Type.Readonly(Type.Boolean()),
    SWAPI_CLIENT_PUBLIC_BASE_PATH: Type.String({ minLength: 1, default: '/' }),
    SWAPI_CLIENT_SERVER_PORT_DEV: Type.Optional(Type.Readonly(Type.Integer())),
    SWAPI_CLIENT_SERVER_PORT_PREVIEW: Type.Optional(Type.Readonly(Type.Integer())),
    SWAPI_RUN_MODE: Type.Readonly(RunModeSchema),
  }),
])

export type AppBuildEnv = Static<typeof AppBuildEnvSchema>
