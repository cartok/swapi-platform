import type { Static, TSchema } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import { AssertError, Value } from '@sinclair/typebox/value'

const LogLevelSchema = Type.Union([
  Type.Literal('debug'),
  Type.Literal('info'),
  Type.Literal('warn'),
  Type.Literal('error'),
])

export const ProfileSchema = Type.Union([Type.Literal('debug'), Type.Literal('release')])

export const RunModeSchema = Type.Union([Type.Literal('source'), Type.Literal('build')])

export const BuildSourcemapSchema = Type.Union([
  Type.Literal('none'),
  Type.Literal('external'),
  Type.Literal('hidden'),
  Type.Literal('inline'),
])

const TargetSchema = Type.Union([
  Type.Literal('local'),
  Type.Literal('pages'),
  Type.Literal('testing'),
  Type.Literal('production'),
])

export const CommonEnvSchema = Type.Object({
  SWAPI_LOG_LEVEL: Type.Readonly(LogLevelSchema),
  SWAPI_PROFILE: Type.Readonly(ProfileSchema),
  SWAPI_TARGET: Type.Readonly(TargetSchema),
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
