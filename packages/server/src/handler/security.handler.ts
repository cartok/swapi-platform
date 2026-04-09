import type express from 'express'

import { env } from '#internal/env'

const allowedHosts: Readonly<Set<string>> = new Set(
  env.NG_ALLOWED_HOSTS.split(',')
    .map((x) => x.trim().toLowerCase())
    .filter(Boolean),
)
export function addSecurityHandler(server: express.Express) {
  server.use((req, res, next) => {
    const protocol = req.protocol
    if (env.SWAPI_TARGET === 'local') {
      if (!/^http$/.test(protocol)) {
        throw new Error(`Invalid protocol ${protocol}.`)
      }
    } else {
      if (!/^https$/.test(protocol)) {
        throw new Error(`Invalid protocol ${protocol}.`)
      }
    }

    const hostname = req.hostname?.toLowerCase()
    if (!hostname) {
      return res.status(400).send('Missing host header.')
    }

    if (!isHostAllowed(hostname, allowedHosts)) {
      return res.status(400).send('Host not allowed.')
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
