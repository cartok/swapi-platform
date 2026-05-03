import { readFile } from 'node:fs/promises'
import { normalize, resolve } from 'node:path'

import { ssgDistPath } from '@swapi/client/dist-paths'
import { isAbortLikeError } from '@swapi/shared/errors/abort-error'

import { CACHE_TAGS, DOCUMENT_CACHE_HEADERS } from '#internal/cache/cache'
import { isErrorCode, SERVER_ERROR_CODES } from '#internal/error/error'
import { abortResponse } from '#internal/request/abort.handler'
import type { Handler } from '#internal/types'

export const addSsgHandler: Handler = (hono) => {
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
      return abortResponse(c, 'Before SSG file loading')
    }

    try {
      const html = await readFile(ssgFilePath, {
        encoding: 'utf8',
        signal: abortController.signal,
      })

      if (
        abortController.signal.aborted &&
        abortController.abortContext?.source === 'client'
      ) {
        return abortResponse(c, 'Before serving SSG file')
      }

      console.log('SSG: Serve', ssgFilePath)

      return c.html(html, 200, {
        ...DOCUMENT_CACHE_HEADERS,
        'Cache-Tag': [CACHE_TAGS.HTML, CACHE_TAGS.SSG],
      })
    } catch (error) {
      if (isAbortLikeError(error)) {
        return abortResponse(c, 'On error during SSG file loading')
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
