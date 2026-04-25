import type { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'

import { GLOBAL_SWAPI_TARGET } from '#internal/env'
import type { Handler, HonoEnv } from '#internal/types'

export const honoFetchWithForwardedProtocol: Handler<Hono<HonoEnv>['fetch']> = (hono) => {
  return (request, ...rest) => {
    let rewrittenRequest: Request

    try {
      rewrittenRequest = rewriteRequestWithForwardedProtocol(request)
    } catch (error: unknown) {
      if (error instanceof HTTPException) {
        return error.getResponse()
      }
      console.error(error)
      return new Response('Server Error', { status: 500 })
    }

    return rewrittenRequest
      ? hono.fetch(rewrittenRequest, ...rest)
      : hono.fetch(request, ...rest)
  }
}

export function rewriteRequestWithForwardedProtocol(request: Request): Request {
  const forwardedProtocol = request.headers.get('X-Forwarded-Proto')
  if (!forwardedProtocol) {
    return request
  }
  if (GLOBAL_SWAPI_TARGET !== 'local' && forwardedProtocol === 'http') {
    throw new HTTPException(400, { message: 'Forwarding HTTP is forbidden.' })
  }
  if (forwardedProtocol !== 'https') {
    throw new HTTPException(400, {
      message: `Invalid value for X-Forwarded-Protocol ${forwardedProtocol}.`,
    })
  }

  const url = new URL(request.url)
  const targetUrlProtocol = `${forwardedProtocol}:`

  if (url.protocol === targetUrlProtocol) {
    return request
  } else {
    url.protocol = targetUrlProtocol
    const rewrittenRequest = new Request(url, request)
    return rewrittenRequest
  }
}
