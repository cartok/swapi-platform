import '@angular/compiler'

import { CommonEngine } from '@angular/ssr/node'
import { browserDistPath, indexHtmlPath } from '@swapi/client/dist-paths'
import express from 'express'

import { enableAngularServerMode } from '#internal/angular-server-mode'
import { allowedHosts, env } from '#internal/env'
import { addDeviceContextHandler } from '#internal/handler/device-context.handler'
import { addDeviceCookieHandler } from '#internal/handler/device-cookie.handler'
import { addDeviceRedirectHandler } from '#internal/handler/device-redirect.handler'
import { addSecurityHandler } from '#internal/handler/security.handler'
import { addSsgHandler } from '#internal/handler/ssg.handler'

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
      allowedHosts,
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

addSsgHandler(server)

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

const host = env.SWAPI_SERVER_HOST_INTERNAL
const port = env.SWAPI_SERVER_PORT

server.listen(port, host, () => {
  console.log(`Server listening on ${host}:${port}`)
})
