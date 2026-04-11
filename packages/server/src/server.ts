import '@angular/compiler'

import { access, constants } from 'node:fs/promises'
import { normalize, resolve, sep } from 'node:path'

import { CommonEngine } from '@angular/ssr/node'
import { browserDistPath, indexHtmlPath, ssgDistPath } from '@swapi/client/dist-paths'
import express from 'express'

import { enableAngularServerMode } from '#internal/angular-server-mode'
import { env } from '#internal/env'
import { addDeviceContextHandler } from '#internal/handler/device-context.handler'
import { addDeviceCookieHandler } from '#internal/handler/device-cookie.handler'
import { addDeviceRedirectHandler } from '#internal/handler/device-redirect.handler'
import { addSecurityHandler } from '#internal/handler/security.handler'

enableAngularServerMode()

const server = express()
server.set('trust proxy', true)

let angularAppPromise: Promise<CommonEngine> | undefined

void getAngularRenderEngine()

function getAngularRenderEngine(): Promise<CommonEngine> {
  if (angularAppPromise) {
    return angularAppPromise
  }

  angularAppPromise = (async () => {
    const { default: bootstrap } = await import('@swapi/client/main.server')
    return new CommonEngine({
      bootstrap,
    })
  })()

  return angularAppPromise
}

addSecurityHandler(server)
addDeviceCookieHandler(server)
addDeviceContextHandler(server)
addDeviceRedirectHandler(server)

server.use(
  express.static(browserDistPath, {
    maxAge: env.SWAPI_TARGET !== 'local' ? '7d' : 0,
  }),
)

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

server.use(async (req, res, next) => {
  try {
    const angular = await getAngularRenderEngine()
    const url = `${req.protocol}://${req.host}${req.url}`
    const html = await angular.render({
      url,
      documentFilePath: indexHtmlPath,
    })
    console.log(`SSR: Rendered ${url}`)

    return res.status(200).send(html)
  } catch (error) {
    return next(error)
  }
})

server.use((error: unknown, req: express.Request, res: express.Response) => {
  console.error(error)

  if (res.headersSent) {
    return
  }

  if (req.path === '/error') {
    res.status(500).send('Server Error')
    return
  }

  return res.redirect(302, '/error')
})

const port = env.SWAPI_SERVER_PORT
server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

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

  const errorWithCode = error as NodeJS.ErrnoException
  return typeof errorWithCode.code === 'string' && errorWithCode.code === code
}
