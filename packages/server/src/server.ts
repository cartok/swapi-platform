import '@angular/compiler'

import { CommonEngine } from '@angular/ssr/node'
import express from 'express'

import { CLIENT_DIST_FOLDER, INDEX_HTML } from '##/client-dist'
import { env } from '##/env'
import { addDeviceContextHandler } from '##/handler/device-context.handler'
import { addDeviceCookieHandler } from '##/handler/device-cookie.handler'
import { addDeviceRedirectHandler } from '##/handler/device-redirect.handler'
import { addSecurityHandler } from '##/handler/security.handler'

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
    })
  })()

  return angularAppPromise
}
void getAngularRenderEngine()

addSecurityHandler(server)
addDeviceCookieHandler(server)
addDeviceContextHandler(server)
addDeviceRedirectHandler(server)

server.use(
  express.static(CLIENT_DIST_FOLDER, {
    maxAge: env.SWAPI_TARGET !== 'local' ? '7d' : 0,
  }),
)

server.use(async (req, res, next) => {
  try {
    const angular = await getAngularRenderEngine()
    const url = `${req.protocol}://${req.host}${req.url}`
    const html = await angular.render({
      url,
      documentFilePath: INDEX_HTML,
      publicPath: CLIENT_DIST_FOLDER,
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

const port = env.SWAPI_PORT
server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
