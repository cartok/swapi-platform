import { access, constants } from 'node:fs/promises'
import { normalize, resolve, sep } from 'node:path'

import { ssgDistPath } from '@swapi/client/dist-paths'
import type express from 'express'

export function addSsgHandler(server: express.Express): void {
  server.use(async (req, res, next) => {
    if (!isHtmlDocumentRequest(req)) {
      return next()
    }

    const ssgFilePath = resolveSsgFilePath(req.path)
    if (!isInsideDirectory(ssgFilePath, ssgDistPath)) {
      return next()
    }

    try {
      await access(ssgFilePath, constants.F_OK)
      console.log('SSG: Serve', ssgFilePath)
      return res.sendFile(ssgFilePath, (error) => {
        if (error) {
          return next(error)
        }
      })
    } catch (error) {
      if (isErrorCode(error, 'ENOENT')) {
        return next()
      }

      return next(error)
    }
  })
}

function isHtmlDocumentRequest(req: express.Request): boolean {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return false
  }

  if (isFileRequestPath(req.path)) {
    return false
  }

  const accept = req.get('accept')
  if (!accept) {
    return true
  }

  return (
    accept.includes('text/html') ||
    accept.includes('application/xhtml+xml') ||
    accept.includes('*/*')
  )
}

function isFileRequestPath(pathname: string): boolean {
  try {
    return /\.[a-zA-Z0-9]+$/.test(decodeURIComponent(pathname))
  } catch {
    return /\.[a-zA-Z0-9]+$/.test(pathname)
  }
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
