import { access, constants, readFile } from 'node:fs/promises'
import { normalize, resolve, sep } from 'node:path'

import { ssgDistPath } from '@swapi/client/dist-paths'

import type { Handler } from '#internal/types'

export const addSsgHandler: Handler = (hono) => {
  hono.get('*', async (c, next) => {
    if (!c.get('isHtmlDocumentRequest')) {
      return next()
    }

    const ssgFilePath = resolveSsgFilePath(c.req.path)
    if (!isInsideSsgDirectory(ssgFilePath, ssgDistPath)) {
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

function resolveSsgFilePath(pathname: string): string {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, '')
  return resolve(ssgDistPath, normalizedPath, 'index.html')
}

function isInsideSsgDirectory(filePath: string, dirPath: string): boolean {
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
