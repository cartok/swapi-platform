import { isHtmlDocumentRequest } from '@swapi/shared/routing/is-html-document-request'

import type { Handler } from '#internal/types'

export const addDocumentRequestContextHandler: Handler = (hono) => {
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
