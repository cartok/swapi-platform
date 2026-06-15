import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'

// Those vite runner related imports had to be relative.
import {
  CommonAppEnvSchema,
  CommonEnvSchema,
  SourceModeSchema,
} from '../../shared/src/environment/env'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ViteModeSchema = Type.Union([
  Type.Literal('development'),
  Type.Literal('production'),
])

export type ViteMode = Static<typeof ViteModeSchema>

const ViteSourceMapsSchema = Type.Union([
  Type.Boolean(),
  Type.Literal('hidden'),
  Type.Literal('inline'),
])

export const AppBrowserEnvSchema = Type.Intersect([
  CommonAppEnvSchema,
  CommonEnvSchema,
  Type.Object({
    SWAPI_USE_MOCK: Type.Readonly(Type.Boolean()),
  }),
])

export type AppBrowserEnv = Static<typeof AppBrowserEnvSchema>

export const AppBuildEnvSchema = Type.Intersect([
  CommonAppEnvSchema,
  CommonEnvSchema,
  Type.Object({
    SWAPI_CLIENT_PUBLIC_BASE_PATH: Type.String({ minLength: 1, default: '/' }),
    SWAPI_CLIENT_SERVER_PORT_DEV: Type.Optional(Type.Readonly(Type.Integer())),
    SWAPI_CLIENT_SERVER_PORT_PREVIEW: Type.Optional(Type.Readonly(Type.Integer())),
    SWAPI_MINIFY: Type.Readonly(Type.Boolean()),
    SWAPI_SOURCE_MODE: Type.Readonly(SourceModeSchema),
    SWAPI_VITE_SOURCE_MAPS: Type.Readonly(ViteSourceMapsSchema),
  }),
])

export type AppBuildEnv = Static<typeof AppBuildEnvSchema>
