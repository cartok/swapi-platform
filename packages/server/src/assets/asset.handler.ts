import console from 'node:console'
import { readFileSync } from 'node:fs'
import { extname, normalize, resolve } from 'node:path'

import { browserDistPath } from '@swapi/client/dist-paths'
import {
  HASHED_FILE_CACHE_HEADERS,
  NO_STORE_CACHE_HEADERS,
  UNHASHED_ASSET_CACHE_HEADERS,
  UNHASHED_SCRIPT_AND_STYLE_CACHE_HEADERS,
} from '@swapi/shared/cache/cache-control'
import { fileExtensionCacheTagHeadersMap } from '@swapi/shared/cache/cache-tags'
import { createFileBasedWeakETagHeader } from '@swapi/shared/cache/etags'
import {
  ASSET_FILE_EXTENSION_SET,
  isRegisteredFileExtension,
  SCRIPT_FILE_EXTENSION_SET,
  STYLE_FILE_EXTENSION_SET,
} from '@swapi/shared/cache/file-extensions'
import { serveStatic } from 'hono/bun'
import type { Manifest } from 'vite'

import { createAbortResponse } from '#internal/request/request-abort.handler'
import type { Handler } from '#internal/types'

const viteManifestPath = resolve(browserDistPath, '.vite/manifest.json')
const viteAssets: ReadonlySet<string> = readAssetPaths()

export const addAssetHandler: Handler = (hono) => {
  hono.get('*', (c, next) => {
    if (c.get('isHtmlDocumentRequest')) {
      return next()
    }

    if (c.get('abortController').signal.aborted) {
      return Promise.resolve(createAbortResponse(c, 'Before serving asset'))
    }

    return serveStatic({
      root: browserDistPath,
      onFound: async (path, c) => {
        const headers = await resolveHeaders({
          filePath: path,
          requestPath: c.req.path,
        })
        for (const [k, v] of Object.entries(headers)) {
          c.header(k, v)
        }
      },
    })(c, next)
  })
}

async function resolveHeaders({
  filePath,
  requestPath,
}: {
  filePath: string
  requestPath: string
}): Promise<Record<string, string>> {
  const fileExtension = fileExtensionFromPath(filePath)

  if (fileExtension === 'map') {
    return NO_STORE_CACHE_HEADERS
  }

  if (fileExtension === null) {
    console.warn(`Will serve file that has no file extension: ${filePath}`)
    return NO_STORE_CACHE_HEADERS
  }

  if (isRegisteredFileExtension(fileExtension)) {
    const cacheTagHeader = fileExtensionCacheTagHeadersMap.get(fileExtension)

    if (viteAssets.has(normalize(filePath))) {
      return {
        ...HASHED_FILE_CACHE_HEADERS,
        ...cacheTagHeader,
      }
    } else {
      const weakETagHeader = await createFileBasedWeakETagHeader({
        filePath,
        requestPath,
      })

      if (
        SCRIPT_FILE_EXTENSION_SET.has(fileExtension) ||
        STYLE_FILE_EXTENSION_SET.has(fileExtension)
      ) {
        return {
          ...UNHASHED_SCRIPT_AND_STYLE_CACHE_HEADERS,
          ...cacheTagHeader,
          ...weakETagHeader,
        }
      }

      if (ASSET_FILE_EXTENSION_SET.has(fileExtension)) {
        return {
          ...UNHASHED_ASSET_CACHE_HEADERS,
          ...cacheTagHeader,
          ...weakETagHeader,
        }
      }
    }
  }

  console.warn(`Will serve '.${fileExtension}' file without cache tags: ${filePath}`)
  return NO_STORE_CACHE_HEADERS
}

function readAssetPaths(): ReadonlySet<string> {
  const manifest = JSON.parse(readFileSync(viteManifestPath, 'utf8')) as Manifest
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

function fileExtensionFromPath(filePath: string): string | null {
  const fileExtension = extname(filePath).toLowerCase()
  if (fileExtension === '') {
    return null
  }

  return fileExtension.slice(1)
}
