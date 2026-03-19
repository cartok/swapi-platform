import '@angular/compiler'

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CommonEngine, createNodeRequestHandler, isMainModule } from '@angular/ssr/node'
import express from 'express'

import { addDeviceContextHandler } from '@/server/express/handler/device-context.handler'
import { addDeviceCookieHandler } from '@/server/express/handler/device-cookie.handler'
import { addDeviceRedirectHandler } from '@/server/express/handler/device-redirect.handler'

const serverDistFolder = dirname(fileURLToPath(import.meta.url))
const distFolder = resolve(serverDistFolder, '..')
const clientDistFolder = resolve(distFolder, './client')

const server = express()
let angularAppPromise: Promise<CommonEngine> | undefined
const angularServerEntrypoint = import('@/server/angular/main.server')
void getAngularRenderEngine()

addDeviceCookieHandler(server)
addDeviceContextHandler(server)
addDeviceRedirectHandler(server)

server.use(
  express.static(clientDistFolder, {
    maxAge: '7d',
    index: ['index.html'],
    redirect: true,
  }),
)

server.use(async (req, res, next) => {
  try {
    const angular = await getAngularRenderEngine()
    const protocol = req.protocol
    if (!/https?/.test(protocol)) {
      throw new Error(`Invalid protocol ${protocol}.`)
    }
    const host = req.host
    if (!host) {
      throw new Error('Missing host header.')
    }
    const url = `${protocol}://${host}${req.originalUrl}`
    const html = await angular.render({
      url,
      documentFilePath: resolve(clientDistFolder, 'index.html'),
      publicPath: clientDistFolder,
    })
    console.log(`SSR: Rendered ${url}`)
    res.status(200).send(html)
  } catch (error) {
    next(error)
  }
})

function getAngularRenderEngine(): Promise<CommonEngine> {
  if (angularAppPromise) {
    return angularAppPromise
  }

  angularAppPromise = (async () => {
    const { default: bootstrap } = await angularServerEntrypoint
    const allowedHosts = ['localhost', '127.0.0.1', '::1']
    return new CommonEngine({ bootstrap, allowedHosts })
  })()

  return angularAppPromise
}

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
  // TODO: dotenv
  const port = process.env['PORT'] || 4000
  server.listen(port, (error) => {
    if (error) {
      throw error
    }

    console.log(`Node Express server listening on http://localhost:${port}`)
  })
}

export const reqHandler = createNodeRequestHandler(server)
