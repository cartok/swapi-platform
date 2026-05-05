import { unknownToString } from '@swapi/shared/log/log'

export type AbortReason = undefined | DOMException | Error | string

export function toAbortReason(reason: unknown): AbortReason {
  if (
    reason === undefined ||
    reason instanceof DOMException ||
    reason instanceof Error ||
    typeof reason === 'string'
  ) {
    return reason
  }

  return unknownToString(reason)
}
