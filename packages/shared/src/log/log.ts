export function logHeading(heading: string): string {
  return `>>> ${heading.toUpperCase()}\n`
}

type Primitive = string | number | boolean | bigint | symbol | null | undefined

export function isPrimitive(value: unknown): value is Primitive {
  return value === null || (typeof value !== 'object' && typeof value !== 'function')
}

export function unknownToString(value: unknown): string {
  if (isPrimitive(value)) {
    return String(value)
  }
  if (value instanceof Error) {
    return errorToString(value)
  }
  if (value instanceof Response) {
    return responseToString(value)
  }
  return objectToString(value)
}

export function objectToString(object: object): string {
  try {
    return JSON.stringify(object)
  } catch {
    return Object.prototype.toString.call(object)
  }
}

export function responseToString(response: Response): string {
  const { ok, redirected, status, statusText, type, url } = response

  return objectToString({ ok, redirected, status, statusText, type, url })
}

export function errorToString(error: unknown): string {
  if (error instanceof Error) {
    const errorBasis = error.stack ?? `${error.name}: ${error.message}`

    if (error.cause === undefined) {
      return errorBasis
    }

    return [errorBasis, errorToString(error.cause)].join('\n')
  }

  if (typeof error === 'object' && error !== null) {
    return objectToString(error)
  }

  return String(error)
}
