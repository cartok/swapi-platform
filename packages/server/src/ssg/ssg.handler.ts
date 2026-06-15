import { readdir } from 'node:fs/promises'
import { normalize, resolve } from 'node:path'

import { ssgDistPath } from '@swapi/client/dist-paths'
import type { HonoHandler } from '@swapi/hono/types'
import { DOCUMENT_CACHE_HEADERS } from '@swapi/shared/cache/cache-control'
import { CACHE_TAGS } from '@swapi/shared/cache/cache-tags'
import { createCommitBasedWeakETagHeader } from '@swapi/shared/cache/etags'
import { isAbortLikeError } from '@swapi/shared/errors/abort-error'

import { DCE_GIT_COMMIT_SHA, DCE_SWAPI_LOCAL_E2E } from '#internal/env'
import { isErrorCode, SERVER_ERROR_CODES } from '#internal/error/error'
import { createAbortResponse } from '#internal/request/request-abort.handler'
import type { ServerHonoEnv } from '#internal/types'

let ssgCache: Map<string, string> | null = null

// TODO: extra variable + E2E env union variable
const useCache = DCE_SWAPI_LOCAL_E2E

if (useCache) {
  console.warn('SSG: Will use runtime cache.')
  const ssgDirents = await readdir(ssgDistPath, {
    recursive: true,
    withFileTypes: true,
  })

  Bun.gc(true)
  console.info('SSG: Memory usage BEFORE cache load:', getMemoryStatistics())
  const ssgEntries = await Promise.all(
    ssgDirents
      .filter((x) => x.isFile())
      .map(async (x): Promise<[string, string]> => {
        const path = `${x.parentPath}/${x.name}`
        const html = await Bun.file(path).text()

        return [path, html]
      }),
  )

  ssgCache = new Map(ssgEntries)

  Bun.gc(true)
  console.info('SSG: Memory usage AFTER cache load:', getMemoryStatistics())
  console.info(`SSG: Created runtime cache. Loaded ${ssgEntries.length} HTML files.`)

  function getMemoryStatistics() {
    const memory = process.memoryUsage()

    return {
      heapUsedMb: bytesToMb(memory.heapUsed),
      heapTotalMb: bytesToMb(memory.heapTotal),
      rssMb: bytesToMb(memory.rss),
      externalMb: bytesToMb(memory.external),
    } as const
  }

  function bytesToMb(bytes: number): string {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }
}

export const addSsgHandler: HonoHandler<ServerHonoEnv> = (hono) => {
  hono.get('*', async (c, next) => {
    if (!c.get('isHtmlDocumentRequest')) {
      return next()
    }

    if (c.req.header('X-Skip-SSG') === 'true') {
      return next()
    }

    const ssgFilePath = securelyResolveSsgFilePath(c.req.path)
    if (!ssgFilePath) {
      return next()
    }

    const abortController = c.get('abortController')
    if (abortController.signal.aborted) {
      return createAbortResponse(c, 'Before SSG file loading')
    }

    try {
      let html = ssgCache?.get(ssgFilePath)
      if (html) {
        console.info('SSG: Loaded from cache:', ssgFilePath)
      } else {
        html = await Bun.file(ssgFilePath).text()
        console.info('SSG: Loaded file:', ssgFilePath)
        ssgCache?.set(ssgFilePath, html)
      }

      if (
        abortController.signal.aborted &&
        abortController.abortContext?.source === 'client'
      ) {
        return createAbortResponse(c, 'Before serving SSG file')
      }

      return c.html(html, 200, {
        ...DOCUMENT_CACHE_HEADERS,
        'Cache-Tag': [CACHE_TAGS.HTML, CACHE_TAGS.SSG],
        ...createCommitBasedWeakETagHeader(DCE_GIT_COMMIT_SHA),
      })
    } catch (error) {
      if (isAbortLikeError(error)) {
        return createAbortResponse(c, 'On error during SSG file loading')
      }

      if (isErrorCode(error, SERVER_ERROR_CODES.ENOENT)) {
        return next()
      }

      throw error
    }
  })
}

function securelyResolveSsgFilePath(pathname: string): string | null {
  const relativeFilePathSegment = urlPathToRelativeFilePathSegment(pathname)
  const absolutePath = resolve(ssgDistPath, relativeFilePathSegment, 'index.html')
  const normalizedAbsoluteFilePath = normalize(absolutePath)
  const normalizedAbsoluteDistPath = normalize(ssgDistPath)
  if (!normalizedAbsoluteFilePath.startsWith(`${normalizedAbsoluteDistPath}/`)) {
    return null
  }
  return normalizedAbsoluteFilePath
}

function urlPathToRelativeFilePathSegment(urlPath: string): string {
  return urlPath.replace(/^\/|\/$/g, '')
}
