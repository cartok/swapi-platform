import { allowedHosts, GLOBAL_SWAPI_TARGET } from '#internal/env'
import type { Handler } from '#internal/types'

const allowedHostSet: Readonly<Set<string>> = new Set(allowedHosts)
const isBehindTrustedProxy = Boolean(process.env['FLY_APP_NAME'])

export const addRequestGuardHandler: Handler = (hono) => {
  hono.use('*', async (c, next) => {
    const requestUrl = new URL(c.req.url)

    if (GLOBAL_SWAPI_TARGET !== 'local') {
      if (isBehindTrustedProxy) {
        const forwardedProto = c.req.header('X-Forwarded-Proto')
        if (forwardedProto !== 'https') {
          return c.text('HTTPS required.', 400)
        }
      } else {
        if (requestUrl.protocol === 'http') {
          return c.text('Not behind trusted proxy. HTTPS required.', 400)
        }
      }
    }

    const hostHeader = c.req.header('host')
    if (!hostHeader) {
      return c.text('Missing host header.', 400)
    }

    const hostname = requestUrl.hostname.toLowerCase()
    if (!isHostAllowed(hostname, allowedHostSet)) {
      return c.text('Host not allowed.', 400)
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
