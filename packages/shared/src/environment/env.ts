import type { Static, TObject, TSchema } from '@sinclair/typebox'
import { TypeBoxError } from '@sinclair/typebox'
import { AssertError, Value } from '@sinclair/typebox/value'

import { typeboxAssertErrorToString } from '#internal/errors/typebox'

import type { EnvSchemaKey } from './env.schema.js'

export function parseEnv<T extends TSchema>(
  schema: T,
  raw: Record<keyof Required<Static<T>>, unknown>,
): Readonly<Static<T>> {
  const parsed = Value.Parse(['Clone', 'Default', 'Convert'], schema, raw)

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

export function parseSecretEnv<T extends TSchema>(
  schema: T,
  raw: Record<keyof Required<Static<T>>, unknown>,
): Readonly<Static<T>> {
  return Object.freeze(Value.Parse(['Clone', 'Default', 'Convert'], schema, raw))
}

export function validateRequiredSecretEnv<T extends TObject>(
  schema: T,
  env: Readonly<Static<T>>,
): void {
  const requiredKeys = getEnvSchemaKeys(schema)
  const missingKeys: EnvSchemaKey<T>[] = []

  for (const key of requiredKeys) {
    const value = env[key]

    if (value === undefined || value === '') {
      missingKeys.push(key)
    }
  }

  const invalidKeys = getInvalidSecretEnvKeys(schema, env, requiredKeys)

  for (const key of missingKeys) {
    invalidKeys.delete(key)
  }

  if (!missingKeys.length && !invalidKeys.size) {
    return
  }

  const details = [
    missingKeys.length ? `missing: ${missingKeys.join(', ')}` : '',
    invalidKeys.size ? `invalid: ${[...invalidKeys].join(', ')}` : '',
  ].filter(Boolean)

  throw new Error(`Invalid runtime secret environment (${details.join('; ')}).`)
}

export function logEnv(env: Record<string, unknown>, title?: string): void {
  if (title) {
    console.info(`${title}:`)
  }

  console.info(env)
}

function getEnvSchemaKeys<T extends TObject>(schema: T): EnvSchemaKey<T>[] {
  return Object.keys(schema.properties) as EnvSchemaKey<T>[]
}

function getInvalidSecretEnvKeys<T extends TObject>(
  schema: T,
  env: Readonly<Static<T>>,
  requiredKeys: readonly EnvSchemaKey<T>[],
): Set<EnvSchemaKey<T>> {
  const keys = new Set<EnvSchemaKey<T>>()

  for (const error of Value.Errors(schema, env)) {
    const key = error.path.replace(/^\//, '').split('/')[0] ?? ''

    if (isEnvSchemaKey(key, requiredKeys)) {
      keys.add(key)
    }
  }

  return keys
}

function isEnvSchemaKey<T extends TObject>(
  key: string,
  keys: readonly EnvSchemaKey<T>[],
): key is EnvSchemaKey<T> {
  return keys.includes(key as EnvSchemaKey<T>)
}
