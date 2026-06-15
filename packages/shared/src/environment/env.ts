import type { Static, TSchema } from '@sinclair/typebox'
import { Type, TypeBoxError } from '@sinclair/typebox'
import { AssertError, Value } from '@sinclair/typebox/value'

import { typeboxAssertErrorToString } from '#internal/errors/typebox'

const LogLevelSchema = Type.Union([
  Type.Literal('debug'),
  Type.Literal('info'),
  Type.Literal('warn'),
  Type.Literal('error'),
])

const BuildLevelSchema = Type.Union([
  Type.Literal('development'),
  Type.Literal('release'),
])

export const SourceModeSchema = Type.Union([Type.Literal('source'), Type.Literal('dist')])

const TargetEnvironmentSchema = Type.Union([
  Type.Literal('local'),
  Type.Literal('ci'),
  Type.Literal('testing'),
  Type.Literal('production'),
])

export const CommonEnvSchema = Type.Object({
  SWAPI_LOCAL_E2E: Type.Readonly(Type.Boolean({ default: false })),
})

export const CommonAppEnvSchema = Type.Object({
  SWAPI_BUILD_LEVEL: Type.Readonly(BuildLevelSchema),
  SWAPI_LOG_LEVEL: Type.Readonly(LogLevelSchema),
  SWAPI_TARGET_ENVIRONMENT: Type.Readonly(TargetEnvironmentSchema),
})

export function parseEnv<T extends TSchema>(
  schema: T,
  raw: Record<keyof Required<Static<T>>, unknown>,
  options: { secret?: boolean } = {},
): Readonly<Static<T>> {
  const parsed = Value.Parse(['Clone', 'Default', 'Convert'], schema, raw)

  if (options.secret) {
    return Object.freeze(parsed)
  } else {
    try {
      Value.Assert(schema, parsed)
      return Object.freeze(parsed)
    } catch (error) {
      if (error instanceof TypeBoxError) {
        if (error instanceof AssertError) {
          throw new Error(typeboxAssertErrorToString(error))
        }
      }
      throw error
    }
  }
}

export function logEnv(env: Record<string, unknown>, title?: string): void {
  if (title) {
    console.info(`${title}:`)
  }

  console.info(env)
}

export const BaseUrlWithPortSchema = Type.RegExp(
  new RegExp(String.raw`^https?://[^:]+:\d+$`),
)

export const DynamicPortSchema = Type.Integer({ minimum: 49152, maximum: 65535 })
