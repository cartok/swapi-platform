import { errorToString } from '@swapi/shared/log/log'
import type { HTTPResponseError } from 'hono/types'

export const SERVER_ERROR_CODES = {
  ABORT_ERR: 'ABORT_ERR',
  ENOENT: 'ENOENT',
} as const

export type ServerErrorCode = (typeof SERVER_ERROR_CODES)[keyof typeof SERVER_ERROR_CODES]

export function isHonoHTTPResponseError(error: unknown): error is HTTPResponseError {
  return (
    error instanceof Error &&
    typeof (error as { getResponse?: unknown }).getResponse === 'function'
  )
}

export function isErrorCode<const ErrorCode extends ServerErrorCode>(
  error: unknown,
  errorCode: ErrorCode,
): error is Error & { code: ErrorCode } {
  if (!(error instanceof Error)) {
    return false
  }

  const { code } = error as { code?: unknown }

  return typeof code === 'string' && code === errorCode
}

export function toError(value: unknown): Error {
  if (value instanceof Error) return value

  return new Error(errorToString(value))
}
