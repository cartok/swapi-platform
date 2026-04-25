import { extname } from 'node:path'

import { browserDistPath } from '@swapi/client/dist-paths'
import { serveStatic } from 'hono/bun'

import {
  UNHASHED_MEDIA_CACHE_HEADERS,
  UNHASHED_SCRIPT_STYLE_CACHE_HEADERS,
} from '#internal/cache/cache'
import { env } from '#internal/env'
import type { Handler } from '#internal/types'

const NO_STORE_CACHE_HEADERS = {
  'Cache-Control': 'no-store',
  'CDN-Cache-Control': 'no-store',
} as const

const SCRIPT_STYLE_ASSET_EXTENSIONS = new Set(['css', 'js', 'mjs']) as ReadonlySet<string>

const MEDIA_ASSET_EXTENSIONS = new Set([
  'ico',
  'jpg',
  'png',
  'svg',
  'woff2',
]) as ReadonlySet<string>

export const addAssetHandler: Handler = (hono) => {
  hono.on(
    ['GET', 'HEAD'],
    '*',
    serveStatic({
      root: browserDistPath,
      onFound: (path, c) => {
        const cacheHeaders = resolveAssetCacheHeaders(path)
        for (const [headerName, headerValue] of Object.entries(cacheHeaders)) {
          c.header(headerName, headerValue)
        }
      },
    }),
  )
}

function resolveAssetCacheHeaders(path: string): Record<string, string> {
  const fileExtension = toFileExtension(path)

  if (fileExtension === null || fileExtension === 'map') {
    return NO_STORE_CACHE_HEADERS
  }

  if (SCRIPT_STYLE_ASSET_EXTENSIONS.has(fileExtension)) {
    return UNHASHED_SCRIPT_STYLE_CACHE_HEADERS
  }

  if (MEDIA_ASSET_EXTENSIONS.has(fileExtension)) {
    return UNHASHED_MEDIA_CACHE_HEADERS
  }

  return NO_STORE_CACHE_HEADERS
}

function toFileExtension(path: string): string | null {
  const fileExtension = extname(path).toLowerCase()
  if (fileExtension === '') {
    return null
  }

  return fileExtension.slice(1)
}
