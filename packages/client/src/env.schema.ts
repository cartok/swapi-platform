import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'

import { CommonEnvSchema } from '../../shared/src/environment/env'

export const AppBrowserEnvSchema = Type.Intersect([
  CommonEnvSchema,
  Type.Object({
    SWAPI_DEV_TOOLS: Type.Readonly(Type.Boolean()),
  }),
])

export type AppBrowserEnv = Static<typeof AppBrowserEnvSchema>

export const AppBuildEnvSchema = Type.Object({
  SWAPI_DEV_SERVER_PORT: Type.Optional(Type.Readonly(Type.Integer())),
  SWAPI_PREVIEW_SERVER_PORT: Type.Optional(Type.Readonly(Type.Integer())),
  SWAPI_PUBLIC_BASE_PATH: Type.String({ minLength: 1, default: '/' }),
})
