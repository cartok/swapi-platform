const ABORT_ERROR_NAME_SET = new Set<string>(['AbortError', 'TimeoutError'])
const ABORT_ERROR_CODE_SET = new Set<string>(['ABORT_ERR', 'ERR_ABORTED'])

export function isAbortLikeError(error: unknown): boolean {
  if (error === null || typeof error !== 'object') {
    return false
  }

  const { name, code } = error as { name?: unknown; code?: unknown }
  return isAbortLikeName(name) || isAbortLikeCode(code)
}

function isAbortLikeName(name: unknown): boolean {
  if (typeof name !== 'string') {
    return false
  }

  return ABORT_ERROR_NAME_SET.has(name)
}

function isAbortLikeCode(code: unknown): boolean {
  if (typeof code !== 'string') {
    return false
  }

  return ABORT_ERROR_CODE_SET.has(code)
}
