import { access, constants, readFile } from 'node:fs/promises'
import { normalize, resolve, sep } from 'node:path'

import { ssgDistPath } from '@swapi/client/dist-paths'
import type { Hono } from 'hono'

import { isFileRequestPath } from '#internal/handler/request-path.utils'
import type { ServerEnv } from '#internal/server.types'

export function addSsgHandler(server: Hono<ServerEnv>): void {
  server.use('*', async (c, next) => {
    if (!isHtmlDocumentRequest(c.req.method, c.req.path, c.req.header('accept'))) {
      return next()
    }

    const ssgFilePath = resolveSsgFilePath(c.req.path)
    if (!isInsideDirectory(ssgFilePath, ssgDistPath)) {
      return next()
    }

    try {
      await access(ssgFilePath, constants.F_OK)
      console.log('SSG: Serve', ssgFilePath)
      const html = await readFile(ssgFilePath, 'utf8')
      return c.html(html, 200)
    } catch (error) {
      if (isErrorCode(error, 'ENOENT')) {
        return next()
      }

      throw error
    }
  })
}

function isHtmlDocumentRequest(
  method: string,
  path: string,
  accept: string | undefined,
): boolean {
  if (method !== 'GET' && method !== 'HEAD') {
    return false
  }

  if (isFileRequestPath(path)) {
    return false
  }

  if (!accept) {
    return true
  }

  return (
    accept.includes('text/html') ||
    accept.includes('application/xhtml+xml') ||
    accept.includes('*/*')
  )
}

function resolveSsgFilePath(pathname: string): string {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, '')
  return resolve(ssgDistPath, normalizedPath, 'index.html')
}

function isInsideDirectory(filePath: string, dirPath: string): boolean {
  const normalizedFilePath = normalize(filePath)
  const normalizedDirPath = normalize(resolve(dirPath))
  return (
    normalizedFilePath === normalizedDirPath ||
    normalizedFilePath.startsWith(`${normalizedDirPath}${sep}`)
  )
}

function isErrorCode(error: unknown, code: string): boolean {
  if (!(error instanceof Error)) {
    return false
  }

  return 'code' in error && typeof error.code === 'string' && error.code === code
}
