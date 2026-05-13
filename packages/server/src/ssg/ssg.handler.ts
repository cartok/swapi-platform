import { readFile } from 'node:fs/promises'
import { normalize, resolve } from 'node:path'

import { ssgDistPath } from '@swapi/client/dist-paths'
import type { HonoHandler } from '@swapi/hono/types'
import { DOCUMENT_CACHE_HEADERS } from '@swapi/shared/cache/cache-control'
import { CACHE_TAGS } from '@swapi/shared/cache/cache-tags'
import { createCommitBasedWeakETagHeader } from '@swapi/shared/cache/etags'
import { isAbortLikeError } from '@swapi/shared/errors/abort-error'

import { GLOBAL_DEPLOYED_GIT_SHA } from '#internal/env'
import { isErrorCode, SERVER_ERROR_CODES } from '#internal/error/error'
import { createAbortResponse } from '#internal/request/request-abort.handler'
import type { ServerHonoEnv } from '#internal/types'

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
      const html = await readFile(ssgFilePath, {
        encoding: 'utf8',
        signal: abortController.signal,
      })
      console.log('SSG: Loaded', ssgFilePath)

      if (
        abortController.signal.aborted &&
        abortController.abortContext?.source === 'client'
      ) {
        return createAbortResponse(c, 'Before serving SSG file')
      }

      return c.html(html, 200, {
        ...DOCUMENT_CACHE_HEADERS,
        'Cache-Tag': [CACHE_TAGS.HTML, CACHE_TAGS.SSG],
        ...createCommitBasedWeakETagHeader(GLOBAL_DEPLOYED_GIT_SHA),
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
