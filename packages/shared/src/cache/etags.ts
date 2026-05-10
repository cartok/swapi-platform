import { stat } from 'node:fs/promises'

import xxhash from 'xxhash-wasm'

type CacheHeaders = Record<string, string>

export async function createFileBasedWeakETagHeader({
  filePath,
  requestPath,
}: {
  filePath: string
  requestPath: string
}): Promise<CacheHeaders> {
  const stats = await stat(filePath, { bigint: true })
  const payload = `${requestPath}\0${stats.size}\0${stats.mtimeNs}`
  const hasher = await xxhash()
  const hash = hasher.h64(payload)
  const eTag = `W/"file-${hash}"`

  return { ETag: eTag }
}

export function createCommitBasedWeakETagHeader(gitCommitHash: string): CacheHeaders {
  const eTag = `W/"commit-${gitCommitHash}"`

  return { ETag: eTag }
}
