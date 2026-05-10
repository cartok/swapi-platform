import type { DeviceContext } from '@swapi/shared/device/device'
import {
  DEFAULT_DEVICE_FORMAT,
  findClosestHeightBreakpoint,
  findClosestWidthBreakpoint,
} from '@swapi/shared/device/device'
import type { Context } from 'hono'

import type { HonoEnv } from '#internal/types'

export function parseDeviceContextFromHeaders(c: Context<HonoEnv>): DeviceContext {
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

  return deviceContext
}

type HeaderType = string | undefined

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
