import { allowedHosts, env } from '#internal/env'
import type { Handler } from '#internal/types'

const allowedHostSet: Readonly<Set<string>> = new Set(allowedHosts)

export const addRequestGuardHandler: Handler = (hono) => {
  hono.use('*', async (c, next) => {
    const requestUrl = new URL(c.req.url)
    const protocol = requestUrl.protocol.slice(0, -1)

    if (env.SWAPI_TARGET !== 'local' && protocol !== 'https') {
      throw new Error(`Invalid protocol ${protocol}.`)
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
