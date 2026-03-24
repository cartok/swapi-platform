import '@angular/compiler'

import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { CommonEngine } from '@angular/ssr/node'
import express from 'express'

import { addDeviceContextHandler } from '@/handler/device-context.handler'
import { addDeviceCookieHandler } from '@/handler/device-cookie.handler'
import { addDeviceRedirectHandler } from '@/handler/device-redirect.handler'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const clientDistFolder = resolve(
  scriptDir,
  '../../client/dist/production/production/browser',
)
const indexHtml = resolve(clientDistFolder, 'index.html')
let angularAppPromise: Promise<CommonEngine> | undefined

const server = express()
const getAngularRenderEngine = (): Promise<CommonEngine> => {
  if (angularAppPromise) {
    return angularAppPromise
  }

  angularAppPromise = (async () => {
    const { default: bootstrap } = await import('@swapi/client/main.server')
    return new CommonEngine({
      bootstrap,
      allowedHosts: ['localhost', '127.0.0.1', '::1'],
    })
  })()

  return angularAppPromise
}
void getAngularRenderEngine()

addDeviceCookieHandler(server)
addDeviceContextHandler(server)
addDeviceRedirectHandler(server)

server.use(
  express.static(clientDistFolder, {
    maxAge: '7d',
    // TODO: index & redirect are set to default values, right? then remove
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
      documentFilePath: indexHtml,
      publicPath: clientDistFolder,
    })

    console.log(`SSR: Rendered ${url}`)

    res.status(200).send(html)
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
