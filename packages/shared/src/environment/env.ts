import type { Static, TSchema } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import { AssertError, Value } from '@sinclair/typebox/value'

const LogLevelSchema = Type.Union([
  Type.Literal('debug'),
  Type.Literal('info'),
  Type.Literal('warn'),
  Type.Literal('error'),
])

export const OutputModeSchema = Type.Union([
  Type.Literal('development'),
  Type.Literal('production'),
])

const TargetSchema = Type.Union([
  Type.Literal('local'),
  Type.Literal('pages'),
  Type.Literal('testing'),
  Type.Literal('production'),
])

export const CommonEnvSchema = Type.Object({
  SWAPI_LOG_LEVEL: Type.Readonly(LogLevelSchema),
  SWAPI_OUTPUT_MODE: Type.Readonly(OutputModeSchema),
  SWAPI_TARGET: Type.Readonly(TargetSchema),
})

export const BuildEnvSchema = Type.Object({
  SWAPI_OUTPUT_MODE: Type.Readonly(OutputModeSchema),
  SWAPI_TARGET: Type.Readonly(TargetSchema),
})

export function parseCommonEnv(): Readonly<Static<typeof CommonEnvSchema>> {
  return parseEnv(
    {
      SWAPI_LOG_LEVEL: process.env['SWAPI_LOG_LEVEL'],
      SWAPI_OUTPUT_MODE: process.env['SWAPI_OUTPUT_MODE'],
      SWAPI_TARGET: process.env['SWAPI_TARGET'],
    },
    CommonEnvSchema,
  )
}

export function parseBuildEnv(): Readonly<Static<typeof BuildEnvSchema>> {
  return parseEnv(
    {
      SWAPI_OUTPUT_MODE: process.env['SWAPI_OUTPUT_MODE'],
      SWAPI_TARGET: process.env['SWAPI_TARGET'],
    },
    BuildEnvSchema,
  )
}

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
