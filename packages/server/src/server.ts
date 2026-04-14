import { CommonEngine } from '@angular/ssr/node'
import { browserDistPath, indexHtmlPath } from '@swapi/client/dist-paths'
import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'

import { enableAngularServerMode } from '#internal/angular-server-mode'
import { allowedHosts, env } from '#internal/env'
import { addDeviceContextHandler } from '#internal/handler/device-context.handler'
import { addDeviceRedirectHandler } from '#internal/handler/device-redirect.handler'
import { isHtmlDocumentRequest } from '#internal/handler/request-path.utils'
import { addSecurityHandler } from '#internal/handler/security.handler'
import { addSsgHandler } from '#internal/handler/ssg.handler'
import type { ServerEnv } from '#internal/server.types'

enableAngularServerMode()

const app = new Hono<ServerEnv>({ strict: false })

const staticCacheControl =
  env.SWAPI_TARGET !== 'local' ? 'public, max-age=604800' : 'public, max-age=0'

let angularAppPromise: Promise<CommonEngine> | undefined

void getAngularRenderEngine()

const staticAssetHandler = serveStatic({
  root: browserDistPath,
  onFound: (_path, c) => {
    c.header('cache-control', staticCacheControl)
  },
})

addSecurityHandler(app)
addDeviceContextHandler(app)
addDeviceRedirectHandler(app)

app.on(['GET', 'HEAD'], '*', staticAssetHandler)

addSsgHandler(app)

app.use('*', async (c) => {
  if (
    !isHtmlDocumentRequest({
      method: c.req.method,
      pathname: c.req.path,
      acceptHeader: c.req.header('accept'),
    })
  ) {
    return c.notFound()
  }

  const angular = await getAngularRenderEngine()
  const url = c.req.url
  const html = await angular.render({
    url,
    documentFilePath: indexHtmlPath,
  })
  console.log(`SSR: Rendered ${url}`)

  return c.html(html, 200)
})

app.onError((error, c) => {
  console.error(error)

  if (new URL(c.req.url).pathname === '/error') {
    return c.text('Server Error', 500)
  }

  return c.redirect('/error', 302)
})

const host = env.SWAPI_SERVER_HOST_INTERNAL
const port = env.SWAPI_SERVER_PORT

console.log(`Server listening on ${host}:${String(port)}`)

const server = {
  hostname: host,
  port,
  fetch(request: Request): Response | Promise<Response> {
    return app.fetch(withTrustedForwardedHeaders(request))
  },
}

export default server

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

function withTrustedForwardedHeaders(request: Request): Request {
  const forwardedProtocol = parseForwardedHeaderValue(
    request.headers.get('x-forwarded-proto'),
  )
  const forwardedHost = parseForwardedHeaderValue(request.headers.get('x-forwarded-host'))

  if (!forwardedProtocol && !forwardedHost) {
    return request
  }

  const url = new URL(request.url)

  if (forwardedProtocol && isSupportedForwardedProtocol(forwardedProtocol)) {
    url.protocol = `${forwardedProtocol}:`
  }

  if (forwardedHost) {
    try {
      url.host = forwardedHost
    } catch {
      return request
    }
  }

  if (url.toString() === request.url) {
    return request
  }

  return new Request(url, request)
}

function parseForwardedHeaderValue(value: string | null): string | null {
  if (!value) {
    return null
  }

  const firstValue = value.split(',', 1)[0]?.trim()

  return firstValue ? firstValue : null
}

function isSupportedForwardedProtocol(value: string): value is 'http' | 'https' {
  return value === 'http' || value === 'https'
}
