import { env } from '#internal/env'
import hono from '#internal/hono'
import { honoFetchWithForwardedProtocol } from '#internal/security/forwarded-headers'

const fetch =
  env.SWAPI_TARGET === 'local' ? hono.fetch : honoFetchWithForwardedProtocol(hono)

const server = Bun.serve({
  hostname: env.SWAPI_SERVER_HOST_INTERNAL,
  port: env.SWAPI_SERVER_PORT,
  fetch,
})

console.log(`Server running at ${server.url}`)
