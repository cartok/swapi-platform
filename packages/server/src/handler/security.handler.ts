import type { Hono } from 'hono'

import { allowedHosts, env } from '#internal/env'
import type { ServerEnv } from '#internal/server.types'

const allowedHostSet: Readonly<Set<string>> = new Set(allowedHosts)

export function addSecurityHandler(server: Hono<ServerEnv>): void {
  server.use('*', async (c, next) => {
    const requestUrl = new URL(c.req.url)
    const protocol = requestUrl.protocol.slice(0, -1)
    if (env.SWAPI_TARGET === 'local') {
      if (!/^http$/.test(protocol)) {
        throw new Error(`Invalid protocol ${protocol}.`)
      }
    } else {
      if (!/^https$/.test(protocol)) {
        throw new Error(`Invalid protocol ${protocol}.`)
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
