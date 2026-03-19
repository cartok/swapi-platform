import cookieParser from 'cookie-parser'
import express from 'express'
import type { ParamsDictionary } from 'express-serve-static-core'

import type { DeviceCookie } from '@/generated/types/device-cookie.types'
import { validate } from '@/generated/validators/device-cookie.validator.js'

const isProd = process.env['NODE_ENV'] === 'production'
const DEVICE_COOKIE_KEY = 'device'

export function addDeviceCookieHandler(server: express.Express): void {
  server.post(
    '/device-cookie',
    express.json({ limit: '200b' }),
    cookieParser(),
    deviceCookieHandler,
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
const deviceCookieHandler: express.RequestHandler<ParamsDictionary, unknown, unknown> = (
  req,
  res,
) => {
  // Check for existing cookie and delete it if it's bad.
  try {
    const currentCookie: unknown = req.cookies[DEVICE_COOKIE_KEY]
    const valid = validate<DeviceCookie>(currentCookie)
    if (!valid) {
      throw JSON.stringify(validate.errors)
    }
    console.info('Current device cookie:', currentCookie)
  } catch (error) {
    console.warn('Device cookie was invalid:', error)
    res.clearCookie(DEVICE_COOKIE_KEY, { path: '/' })
    console.info('Cleared invalid device cookie.')
  }

  // Assure that request body is valid cookie data.
  const requestBody: unknown = req.body
  try {
    const valid = validate<DeviceCookie>(requestBody)
    if (!valid) {
      throw JSON.stringify(validate.errors)
    }
    console.info('New device cookie:', requestBody)
  } catch (error) {
    console.error('Invalid request body:', error)
    return res
      .status(400)
      .json({ message: `Invalid request body: ${JSON.stringify(req.body)}` })
  }

  // Set new cookie from request body.
  res.cookie(DEVICE_COOKIE_KEY, requestBody, {
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: isProd ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 2,
  })

  return res.status(200).json({
    message: `Successfully set ${DEVICE_COOKIE_KEY} cookie to ${JSON.stringify(requestBody)}`,
  })
}
