import { CommonEngine } from '@angular/ssr/node'
import { indexHtmlPath } from '@swapi/client/dist-paths'

import { allowedHosts } from '#internal/env'
import type { Handler } from '#internal/server.types'
import { enableAngularServerMode } from '#internal/shared/angular-server-mode'
import { isHtmlDocumentRequest } from '#internal/shared/request-filter'

enableAngularServerMode()

let angularRenderEnginePromise: Promise<CommonEngine> | undefined

void getAngularRenderEngine()

export const addSsrHandler: Handler = (hono) => {
  hono.use('*', async (c) => {
    if (
      !isHtmlDocumentRequest({
        method: c.req.method,
        pathname: c.req.path,
        acceptHeader: c.req.header('accept'),
      })
    ) {
      return c.notFound()
    }

    const angularRenderEngine = await getAngularRenderEngine()
    const url = c.req.url
    const html = await angularRenderEngine.render({
      url,
      documentFilePath: indexHtmlPath,
    })
    console.log(`SSR: Rendered ${url}`)

    return c.html(html, 200)
  })
}

function getAngularRenderEngine(): Promise<CommonEngine> {
  if (angularRenderEnginePromise) {
    return angularRenderEnginePromise
  }

  angularRenderEnginePromise = (async () => {
    const { default: bootstrap } = await import('@swapi/client/main.server')
    return new CommonEngine({
      bootstrap,
      allowedHosts,
    })
  })()

  return angularRenderEnginePromise
}
