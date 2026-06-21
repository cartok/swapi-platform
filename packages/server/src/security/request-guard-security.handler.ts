import type { HonoHandler } from '@swapi/hono/types'
import { NO_STORE_CACHE_HEADERS } from '@swapi/shared/cache/cache-control'

import { allowedHosts, DCE_SWAPI_TARGET_ENVIRONMENT } from '#internal/env'
import type { ServerHonoEnv } from '#internal/types'

const allowedHostSet: Readonly<Set<string>> = new Set(allowedHosts)
const isBehindTrustedProxy = Boolean(process.env['FLY_APP_NAME'])

export const addRequestGuardHandler: HonoHandler<ServerHonoEnv> = (hono) => {
  hono.use('*', async (c, next) => {
    const requestUrl = new URL(c.req.url)

    if (DCE_SWAPI_TARGET_ENVIRONMENT !== 'local') {
      if (isBehindTrustedProxy) {
        const forwardedProto = c.req.header('X-Forwarded-Proto')
        if (forwardedProto !== 'https') {
          return c.text('HTTPS required.', 400, NO_STORE_CACHE_HEADERS)
        }
      } else {
        if (requestUrl.protocol === 'http') {
          return c.text(
            'Not behind trusted proxy. HTTPS required.',
            400,
            NO_STORE_CACHE_HEADERS,
          )
        }
      }
    }

    const hostHeader = c.req.header('Host')
    if (!hostHeader) {
      return c.text('Missing host header.', 400, NO_STORE_CACHE_HEADERS)
    }

    const hostname = requestUrl.hostname.toLowerCase()
    if (!isHostAllowed(hostname, allowedHostSet)) {
      return c.text('Host not allowed.', 400, NO_STORE_CACHE_HEADERS)
    }

    return next()
  })
}

function isHostAllowed(hostname: string, allowed: ReadonlySet<string>): boolean {
  if (allowed.has(hostname)) {
    return true
  }

  for (const entry of allowed) {
    if (!entry.startsWith('*.')) {
      continue
    }
    const suffix = entry.slice(1)
    if (hostname.endsWith(suffix)) {
      return true
    }
  }

  return false
}
