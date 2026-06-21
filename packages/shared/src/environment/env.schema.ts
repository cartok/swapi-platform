import type { Static, TSchema } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'

export type EnvSchemaKey<T extends TSchema> = Extract<keyof Static<T>, string>

export const LogLevelSchema = Type.Union([
  Type.Literal('debug'),
  Type.Literal('info'),
  Type.Literal('warn'),
  Type.Literal('error'),
])

export const SourceModeSchema = Type.Union([Type.Literal('source'), Type.Literal('dist')])

export const ProfileSchema = Type.Union([
  Type.Literal('development'),
  Type.Literal('release'),
])

export const NodeEnvSchema = Type.Union([
  Type.Literal('development'),
  Type.Literal('production'),
])

export const IsLocalEndToEndSchema = Type.Optional(Type.Boolean({ default: false }))
export const UseLocalEndToEndCacheSchema = Type.Optional(Type.Boolean({ default: false }))

export const AppTargetEnvironmentSchema = Type.Union([
  Type.Literal('local'),
  Type.Literal('ci'),
  Type.Literal('testing'),
  Type.Literal('production'),
])

export const ViteSourceMapsSchema = Type.Union([
  Type.Boolean(),
  Type.Literal('hidden'),
  Type.Literal('inline'),
])

export const RolldownSourceMapsSchema = Type.Union([
  Type.Boolean(),
  Type.Literal('hidden'),
  Type.Literal('inline'),
])

export const BaseUrlWithPortSchema = Type.RegExp(
  new RegExp(String.raw`^https?://[^:]+:\d+$`),
)

export const DynamicPortSchema = Type.Integer({ minimum: 49152, maximum: 65535 })
export const SecretTokenSchema = Type.String({ minLength: 43, maxLength: 44 })
