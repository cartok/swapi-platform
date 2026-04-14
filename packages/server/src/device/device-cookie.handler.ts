import type { DeviceCookie } from '@swapi/shared/generated/types/device-cookie.types'
import { validate } from '@swapi/shared/generated/validators/device-cookie.validator'
import type { Context, Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import { env } from '#internal/env'
import type { ServerEnv } from '#internal/server.types'

const DEVICE_COOKIE_KEY = 'device'
const DEVICE_COOKIE_BODY_LIMIT_BYTES = 200
const PRODUCTION_DEVICE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7
const LOCAL_DEVICE_COOKIE_MAX_AGE_SECONDS = 60 * 2

export function addDeviceCookieHandler(server: Hono<ServerEnv>): void {
  server.post(
    '/device-cookie',
    bodyLimit({
      maxSize: DEVICE_COOKIE_BODY_LIMIT_BYTES,
      onError: (c) =>
        c.json(
          {
            message: `Request body must not exceed ${String(DEVICE_COOKIE_BODY_LIMIT_BYTES)} bytes.`,
          },
          413,
        ),
    }),
    async (c) => {
      // Check for existing cookie and delete it if it's bad.
      try {
        const currentCookie = getRequestCookie(c, DEVICE_COOKIE_KEY)
        assertDeviceCookieValid(currentCookie)
        console.info('Current device cookie:', currentCookie)
      } catch (error) {
        console.warn('Device cookie was invalid:', error)
        deleteCookie(c, DEVICE_COOKIE_KEY, { path: '/' })
        console.info('Cleared invalid device cookie.')
      }

      // Assure that request body is valid cookie data.
      let requestBody: unknown
      try {
        requestBody = await c.req.json()
      } catch (error) {
        console.error('Invalid request body:', error)
        return c.json({ message: 'Invalid request body: Could not parse JSON.' }, 400)
      }

      try {
        assertDeviceCookieValid(requestBody)
        console.info('New device cookie:', requestBody)
      } catch (error) {
        console.error('Invalid request body:', error)
        return c.json(
          { message: `Invalid request body: ${JSON.stringify(requestBody)}` },
          400,
        )
      }

      // Set new cookie from request body.
      setCookie(c, DEVICE_COOKIE_KEY, JSON.stringify(requestBody), {
        sameSite: 'lax',
        secure: env.SWAPI_TARGET !== 'local',
        path: '/',
        maxAge:
          env.SWAPI_TARGET !== 'local'
            ? PRODUCTION_DEVICE_COOKIE_MAX_AGE_SECONDS
            : LOCAL_DEVICE_COOKIE_MAX_AGE_SECONDS,
      })

      return c.json(
        {
          message: `Successfully set ${DEVICE_COOKIE_KEY} cookie to ${JSON.stringify(requestBody)}`,
        },
        200,
      )
    },
  )
}

/**
 * How to test cookies:
 *
 * @example
 * curl http://localhost:4200/device-cookie \
 *    --json '{ "version": 1, "pointer": "fine", "hover": true}' \
 *    --cookie-jar cookie \
 *    --cookie cookie \
 *  && echo "\n\nCookie is:"; cat cookie
 */
function assertDeviceCookieValid(value: unknown): asserts value is DeviceCookie {
  const valid = validate<DeviceCookie>(value)
  if (!valid) {
    throw new Error(JSON.stringify(validate.errors))
  }
}

function getRequestCookie(c: Context, key: string): unknown {
  return parseCookieValue(getCookie(c, key))
}

function parseCookieValue(value: string | undefined): unknown {
  if (typeof value === 'undefined') {
    return undefined
  }

  try {
    return JSON.parse(value) as unknown
  } catch {
    return value
  }
}
