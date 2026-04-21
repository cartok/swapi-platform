import { CommonEngine } from '@angular/ssr/node'
import { indexHtmlPath } from '@swapi/client/dist-paths'

import { allowedHosts } from '#internal/env'
import { enableAngularServerMode } from '#internal/shared/angular-server-mode'
import type { Handler } from '#internal/types'

enableAngularServerMode()

let angularRenderEnginePromise: Promise<CommonEngine> | undefined

void getAngularRenderEngine()

export const addSsrHandler: Handler = (hono) => {
  hono.get('*', async (c, next) => {
    if (!c.get('isHtmlDocumentRequest')) {
      return next()
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
