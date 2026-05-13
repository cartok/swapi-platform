import type { HonoHandler } from '@swapi/hono/types'
import { DOCUMENT_CACHE_HEADERS } from '@swapi/shared/cache/cache-control'
import { CACHE_TAGS } from '@swapi/shared/cache/cache-tags'
import { createCommitBasedWeakETagHeader } from '@swapi/shared/cache/etags'

import { GLOBAL_DEPLOYED_GIT_SHA } from '#internal/env'
import { createAbortResponse } from '#internal/request/request-abort.handler'
import {
  RenderPoolClosedError,
  RenderQueueFullError,
  RenderQueueTimeoutError,
  RenderRequestTimeoutError,
  RenderTimeoutError,
} from '#internal/ssr/render-worker-pool.errors'
import type { HonoRuntimeOptions, ServerHonoEnv } from '#internal/types'

export const addSsrHandler: HonoHandler<ServerHonoEnv, HonoRuntimeOptions> = (
  hono,
  { runtimeMetrics, runtimeServices },
) => {
  hono.get('*', async (c, next) => {
    if (!c.get('isHtmlDocumentRequest')) {
      return next()
    }

    const abortController = c.get('abortController')
    if (abortController.signal.aborted) {
      return createAbortResponse(c, 'Before rendering SSR')
    }

    try {
      const result = await runtimeServices.ssr.renderPool.render({
        url: c.req.url,
        requestController: abortController,
      })
      console.log(`SSR: Rendered ${c.req.url}`)

      if (result.kind === 'aborted-client') {
        return createAbortResponse(c, 'During SSR rendering')
      }

      return c.html(result.html, 200, {
        ...DOCUMENT_CACHE_HEADERS,
        'Cache-Tag': [CACHE_TAGS.HTML, CACHE_TAGS.SSR],
        ...createCommitBasedWeakETagHeader(GLOBAL_DEPLOYED_GIT_SHA),
      })
    } catch (error) {
      if (error instanceof RenderRequestTimeoutError) {
        return createAbortResponse(c, 'On SSR render request timeout')
      }

      if (
        error instanceof RenderPoolClosedError ||
        error instanceof RenderQueueFullError ||
        error instanceof RenderQueueTimeoutError
      ) {
        return c.text('SSR capacity exceeded', 503)
      }

      if (error instanceof RenderTimeoutError) {
        return c.text('SSR render timeout', 503)
      }

      runtimeMetrics.hono.caughtExceptions++
      console.error(error)
      return c.text('SSR render failed', 500)
    }
  })
}
