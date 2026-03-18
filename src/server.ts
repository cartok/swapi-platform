import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node'
import express from 'express'

import { addDeviceContextHandler } from '@/server/device-context.handler'
import { addDeviceCookieHandler } from '@/server/device-cookie.handler'
import { addDeviceRedirectHandler } from '@/server/device-redirect.handler'

const serverDistFolder = dirname(fileURLToPath(import.meta.url))
const browserDistFolder = resolve(serverDistFolder, '../browser')

const server = express()
const angularApp = new AngularNodeAppEngine()

addDeviceCookieHandler(server)
addDeviceContextHandler(server)
addDeviceRedirectHandler(server)

server.use(
  express.static(browserDistFolder, {
    maxAge: '7d',
    index: false,
    redirect: false,
  }),
)

server.use(async (req, res, next) => {
  try {
    const response = await angularApp.handle(req)
    if (response) {
      writeResponseToNodeResponse(response, res)
      return
    }

    next()
  } catch (error) {
    next(error)
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

  res.redirect(302, '/error')
})

if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000
  server.listen(port, (error) => {
    if (error) {
      throw error
    }

    console.log(`Node Express server listening on http://localhost:${port}`)
  })
}

export const reqHandler = createNodeRequestHandler(server)
