import type { TSchema } from '@sinclair/typebox'
import { type Static, Type } from '@sinclair/typebox'
import { AssertError, Value } from '@sinclair/typebox/value'

export const LogLevel = Type.Union([
  Type.Literal('debug'),
  Type.Literal('info'),
  Type.Literal('warn'),
  Type.Literal('error'),
])

export const OutputMode = Type.Union([
  Type.Literal('development'),
  Type.Literal('production'),
])

export const TargetSchema = Type.Union([
  Type.Literal('local'),
  Type.Literal('testing'),
  Type.Literal('staging'),
  Type.Literal('production'),
])

export const CommonEnvSchema = Type.Object({
  SWAPI_LOG_LEVEL: Type.Readonly(LogLevel),
  SWAPI_OUTPUT_MODE: Type.Readonly(OutputMode),
  SWAPI_TARGET: Type.Readonly(TargetSchema),
})

export function parseEnv<T extends TSchema>(
  raw: Record<keyof Static<T>, unknown>,
  schema: T,
): Readonly<Static<T>> {
  const parsed = Value.Parse(['Default', 'Convert'], schema, raw)

  try {
    Value.Assert(schema, parsed)
    console.info('Parsed environment variables:', parsed)
    return Object.freeze(parsed)
  } catch (error) {
    if (!(error instanceof AssertError) || !error.error) {
      console.log('Unexpected error.')
      throw error
    }
    const variable = error.error.path.replace(/^\//, '')
    const schema = JSON.stringify(error.error.schema)
    throw new Error(
      `Invalid or missing environment variable "${variable}" with schema: ${schema}`,
    )
  }
}
