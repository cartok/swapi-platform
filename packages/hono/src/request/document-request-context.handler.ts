import { isHtmlDocumentRequest } from '@swapi/shared/routing/is-html-document-request'

import type { SharedHonoHandler } from '#internal/types'

export const addDocumentRequestContextHandler: SharedHonoHandler = (hono) => {
  hono.get('*', (c, next) => {
    const result = isHtmlDocumentRequest({
      pathname: c.req.path,
      acceptHeader: c.req.header('Accept'),
    })

    c.set('isHtmlDocumentRequest', result)

    return next()
  })
}
