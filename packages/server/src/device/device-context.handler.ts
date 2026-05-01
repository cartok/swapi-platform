import type { DeviceContext } from '@swapi/shared/device/context'
import {
  DEFAULT_DEVICE_FORMAT,
  findClosestHeightBreakpoint,
  findClosestWidthBreakpoint,
} from '@swapi/shared/device/context'

import { skipDeviceDetection } from '#internal/device/skip-device-detection'
import type { Handler } from '#internal/types'

type HeaderType = string | undefined

export const addDeviceContextHandler: Handler = (hono) => {
  hono.get('*', (c, next) => {
    if (!c.get('isHtmlDocumentRequest')) {
      return next()
    }

    if (skipDeviceDetection(c)) {
      return next()
    }

    // Get client hints from low-entropy headers.
    const mobileHeader = c.req.header('Sec-CH-UA-Mobile')

    // Get client hints from high-entropy headers.
    const formFactorsHeader = c.req.header('Sec-CH-UA-Form-Factors')
    const widthHeader = c.req.header('Sec-CH-Viewport-Width')
    const heightHeader = c.req.header('Sec-CH-Viewport-Height')

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
      'Accept-CH',
      'Sec-CH-UA-Form-Factors, Sec-CH-Viewport-Width, Sec-CH-Viewport-Height',
    )
    c.header('Vary', 'Sec-CH-UA-Form-Factors')
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
  if (formFactor !== null) {
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

  const members = header.split(',')

  for (const member of members) {
    const normalizedMember = member.trim()
    if (normalizedMember.startsWith('"Desktop"')) {
      return 'desktop'
    }
    if (normalizedMember.startsWith('"Mobile"')) {
      return 'mobile'
    }
    if (normalizedMember.startsWith('"Tablet"')) {
      return 'tablet'
    }
  }

  return null
}

function parseViewportDimensionHeader(headerValue: HeaderType): number | null {
  if (!headerValue) {
    return null
  }

  const normalized = headerValue.trim()
  if (normalized.length === 0) {
    return null
  }

  if (!/^[1-9][0-9]*$/.test(normalized)) {
    return null
  }

  const parsed = Number(normalized)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null
  }

  return parsed
}
