import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'

import { CommonEnvSchema } from '../../shared/src/environment/env'

export const AppBrowserEnvSchema = CommonEnvSchema

export type AppBrowserEnv = Static<typeof AppBrowserEnvSchema>

export const AppBuildEnvSchema = Type.Intersect([
  CommonEnvSchema,
  Type.Object({
    SWAPI_CLIENT_DEV_TOOLS: Type.Readonly(Type.Boolean()),
    SWAPI_CLIENT_PUBLIC_BASE_PATH: Type.String({ minLength: 1, default: '/' }),
    SWAPI_CLIENT_SERVER_PORT_DEV: Type.Optional(Type.Readonly(Type.Integer())),
    SWAPI_CLIENT_SERVER_PORT_PREVIEW: Type.Optional(Type.Readonly(Type.Integer())),
  }),
])
