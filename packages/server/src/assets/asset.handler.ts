import console from 'node:console'
import { readFileSync } from 'node:fs'
import { extname, normalize, resolve } from 'node:path'

import { browserDistPath, ssrDistPath } from '@swapi/client/dist-paths'
import { serveStatic } from 'hono/bun'
import type { Manifest } from 'vite'

import {
  ASSET_FILE_EXTENSION_SET,
  HASHED_FILE_CACHE_HEADERS,
  isRegisteredFileExtension,
  NO_STORE_CACHE_HEADERS,
  SCRIPT_FILE_EXTENSION_SET,
  STYLE_FILE_EXTENSION_SET,
  UNHASHED_MEDIA_CACHE_HEADERS,
  UNHASHED_SCRIPT_AND_STYLE_CACHE_HEADERS,
  withCacheTagHeader,
} from '#internal/cache/cache'
import type { Handler } from '#internal/types'

const VITE_MANIFEST_PATH = resolve(ssrDistPath, '.vite/manifest.json')
const ASSET_PATHS: ReadonlySet<string> = readAssetPaths()

export const addAssetHandler: Handler = (hono) => {
  hono.get('*', (c, next) => {
    if (c.get('isHtmlDocumentRequest')) {
      return next()
    }
    return serveStatic({
      root: browserDistPath,
      onFound: (path, c) => {
        const cacheHeaders = resolveAssetCacheHeaders(path)
        for (const [headerName, headerValue] of Object.entries(cacheHeaders)) {
          c.header(headerName, headerValue)
        }
      },
    })(c, next)
  })
}

function resolveAssetCacheHeaders(filePath: string): Record<string, string> {
  const fileExtension = readFileExtension(filePath)
  if (fileExtension === 'map') {
    return NO_STORE_CACHE_HEADERS
  }
  if (fileExtension === null) {
    console.warn(`Will serve file that has no file extension: ${filePath}`)
    return NO_STORE_CACHE_HEADERS
  }

  if (isRegisteredFileExtension(fileExtension)) {
    if (ASSET_PATHS.has(normalize(filePath))) {
      return withCacheTagHeader({
        cacheControlHeaders: HASHED_FILE_CACHE_HEADERS,
        fileExtension,
      })
    }

    if (
      SCRIPT_FILE_EXTENSION_SET.has(fileExtension) ||
      STYLE_FILE_EXTENSION_SET.has(fileExtension)
    ) {
      return withCacheTagHeader({
        cacheControlHeaders: UNHASHED_SCRIPT_AND_STYLE_CACHE_HEADERS,
        fileExtension,
      })
    }

    if (ASSET_FILE_EXTENSION_SET.has(fileExtension)) {
      return withCacheTagHeader({
        cacheControlHeaders: UNHASHED_MEDIA_CACHE_HEADERS,
        fileExtension,
      })
    }
  }

  console.warn(`Will serve '.${fileExtension}' file without cache tags: ${filePath}`)
  return NO_STORE_CACHE_HEADERS
}

function readAssetPaths(): ReadonlySet<string> {
  const manifest = JSON.parse(readFileSync(VITE_MANIFEST_PATH, 'utf8')) as Manifest
  const hashedPaths = new Set<string>()

  for (const chunk of Object.values(manifest)) {
    hashedPaths.add(normalize(resolve(browserDistPath, chunk.file)))
    for (const cssPath of chunk.css ?? []) {
      hashedPaths.add(normalize(resolve(browserDistPath, cssPath)))
    }
    for (const assetPath of chunk.assets ?? []) {
      hashedPaths.add(normalize(resolve(browserDistPath, assetPath)))
    }
  }

  return hashedPaths
}

function readFileExtension(filePath: string): string | null {
  const fileExtension = extname(filePath).toLowerCase()
  if (fileExtension === '') {
    return null
  }

  return fileExtension.slice(1)
}
