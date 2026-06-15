import { AssertError } from '@sinclair/typebox/value'

import { errorToString } from '#internal/log/log'

export function typeboxAssertErrorToString(error: unknown): string {
  if (!(error instanceof AssertError)) {
    throw new Error('This function must be used for typebox `AssertError`s only.')
  }

  if (!error.error) {
    return errorToString(error)
  }

  const valueErrorMessages = Array.from(error.Errors()).map((valueError) => {
    const key = valueError.path.replace(/^\//, '')
    const value = valueError.value

    return [
      valueError.message,
      `Invalid or missing value '${key}: ${String(value)}'`,
      `Expected Schema: ${JSON.stringify(valueError.schema)}`,
    ].join('\n')
  })

  return valueErrorMessages.join('\n')
}
