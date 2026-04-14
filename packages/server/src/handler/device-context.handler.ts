import type { DeviceContext } from '@swapi/shared/device/context'
import {
  DEFAULT_DEVICE_FORMAT,
  findClosestHeightBreakpoint,
  findClosestWidthBreakpoint,
} from '@swapi/shared/device/context'
import type { Hono } from 'hono'
import { parseItem, parseList } from 'structured-headers'

import { isHtmlDocumentRequest } from '#internal/handler/request-path.utils'
import type { ServerEnv } from '#internal/server.types'

type HeaderType = string | undefined

export function addDeviceContextHandler(server: Hono<ServerEnv>): void {
  server.get('*', (c, next) => {
    if (
      !isHtmlDocumentRequest({
        method: c.req.method,
        pathname: c.req.path,
        acceptHeader: c.req.header('accept'),
      })
    ) {
      return next()
    }

    // Get client hints from low-entropy headers.
    const mobileHeader = c.req.header('sec-ch-ua-mobile')

    // Get client hints from high-entropy headers.
    const formFactorsHeader = c.req.header('sec-ch-ua-form-factors')
    const widthHeader = c.req.header('sec-ch-viewport-width')
    const heightHeader = c.req.header('sec-ch-viewport-height')

    // Parse headers and store them.
    const headerDeviceFormat = parseDeviceFormatHeaders({
      formFactorsHeader,
      mobileHeader,
    })

    /**
     * The `width` and `height` values the browser sends in the `Sec-CH-Viewport-*` will
     * not exactly match `window.innerWidth` and `window.InnerHeight`. The browser somewhat seems
     * to calculate in the zoom level. Accurate values can only be received by client-side
     * detection and redirection.
     */
    const headerWidth = parseViewportDimensionHeader(widthHeader)
    const headerHeight = parseViewportDimensionHeader(heightHeader)

    const validDeviceFormat: DeviceContext['format'] =
      headerDeviceFormat ?? DEFAULT_DEVICE_FORMAT
    const validDeviceWidth: DeviceContext['width'] =
      headerWidth === null
        ? undefined
        : (findClosestWidthBreakpoint(headerWidth) ?? undefined)
    const validDeviceHeight: DeviceContext['height'] =
      headerHeight === null
        ? undefined
        : (findClosestHeightBreakpoint(headerHeight) ?? undefined)

    const deviceContext: DeviceContext = {
      format: validDeviceFormat,
      width: validDeviceWidth,
      height: validDeviceHeight,
    }
    c.set('deviceContext', deviceContext)

    // Request high-entropy client hints (available from the next navigation/request).
    c.header(
      'accept-ch',
      'sec-ch-ua-form-factors, sec-ch-viewport-width, sec-ch-viewport-height',
    )
    c.header('vary', 'sec-ch-ua-form-factors')
    return next()
  })
}

function parseDeviceFormatHeaders({
  formFactorsHeader,
  mobileHeader,
}: {
  formFactorsHeader: HeaderType
  mobileHeader: HeaderType
}): DeviceContext['format'] | null {
  const formFactor = parseFormFactorHeader(formFactorsHeader)
  if (typeof formFactor !== 'undefined') {
    return formFactor
  }

  if (typeof mobileHeader !== 'undefined') {
    return mobileHeader === '?0' ? 'desktop' : 'mobile'
  }

  return null
}

function parseFormFactorHeader(header: HeaderType): DeviceContext['format'] | null {
  if (!header) {
    return null
  }

  try {
    const parsed = parseList(header)
    for (const member of parsed) {
      if (Array.isArray(member[0])) {
        continue
      }

      const bareItem = member[0]
      if (typeof bareItem !== 'string') {
        continue
      }

      const normalized = bareItem.toLowerCase()
      if (
        normalized === 'desktop' ||
        normalized === 'tablet' ||
        normalized === 'mobile'
      ) {
        return normalized
      }
    }
  } catch {
    return null
  }

  return null
}

function parseViewportDimensionHeader(headerValue: HeaderType): number | null {
  if (!headerValue) {
    return null
  }

  try {
    const [bareItem] = parseItem(headerValue)
    if (typeof bareItem !== 'number' || !Number.isInteger(bareItem) || bareItem <= 0) {
      return null
    }

    return bareItem
  } catch {
    return null
  }
}
