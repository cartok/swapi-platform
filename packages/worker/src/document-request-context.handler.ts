import type { HonoHandler } from '@swapi/hono/types'
import { isHtmlDocumentRequest } from '@swapi/shared/routing/is-html-document-request'

import type { WorkerHonoEnv } from '#internal/types'

export const addDocumentRequestContextHandler: HonoHandler<WorkerHonoEnv> = (hono) => {
  hono.get('*', (c, next) => {
    c.set(
      'isHtmlDocumentRequest',
      isHtmlDocumentRequest({
        pathname: c.req.path,
        acceptHeader: c.req.header('Accept'),
      }),
    )
    return next()
  })
}
