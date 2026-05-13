import type { HonoHandler } from '@swapi/hono/types'
import { isHtmlDocumentRequest } from '@swapi/shared/routing/is-html-document-request'

import type { ServerHonoEnv } from '#internal/types'

export const addDocumentRequestContextHandler: HonoHandler<ServerHonoEnv> = (hono) => {
  hono.get('*', (c, next) => {
    const isDocumentRequest = isHtmlDocumentRequest({
      pathname: c.req.path,
      acceptHeader: c.req.header('Accept'),
    })

    c.set('isHtmlDocumentRequest', isDocumentRequest)
    return next()
  })
}
