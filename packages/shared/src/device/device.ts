import type { Static } from '@sinclair/typebox'
import { Type } from '@sinclair/typebox'
import { AssertError, Value } from '@sinclair/typebox/value'

import { errorToString } from '#internal/log/log'

export const DEVICE_FORMATS = ['desktop', 'mobile', 'tablet'] as const
export const DEFAULT_DEVICE_FORMAT: DeviceFormat = 'mobile'

export const BREAKPOINTS = {
  width: [1385, 1280, 1100, 768, 601, 430, 360],
  height: [1280, 1080, 915, 820, 430],
} as const

type DeviceFormat = (typeof DEVICE_FORMATS)[number]
export type WidthBreakpoint = (typeof BREAKPOINTS.width)[number]
export type HeightBreakpoint = (typeof BREAKPOINTS.height)[number]

export const DeviceContextSchema = Type.Object(
  {
    format: Type.Union(DEVICE_FORMATS.map((f) => Type.Literal(f))),
    width: Type.Optional(Type.Union(BREAKPOINTS.width.map((bp) => Type.Literal(bp)))),
    height: Type.Optional(Type.Union(BREAKPOINTS.height.map((bp) => Type.Literal(bp)))),
  } as const,
  {
    additionalProperties: false,
  },
)

export const LenientDeviceContextSchema = Type.Object(
  {
    format: Type.Optional(Type.String()),
    width: Type.Optional(Type.Integer({ minimum: 1 })),
    height: Type.Optional(Type.Integer({ minimum: 1 })),
  } as const,
  {
    additionalProperties: false,
  },
)

export type DeviceContext = Static<typeof DeviceContextSchema>
export type LenientDeviceContext = Static<typeof LenientDeviceContextSchema>

export interface RequestContext {
  device: DeviceContext
}

export function findClosestWidthBreakpoint(value: number): WidthBreakpoint | null {
  return findClosestBreakpoint(BREAKPOINTS.width, value)
}

export function findClosestHeightBreakpoint(value: number): HeightBreakpoint | null {
  return findClosestBreakpoint(BREAKPOINTS.height, value)
}

function findClosestBreakpoint<T extends WidthBreakpoint | HeightBreakpoint>(
  breakpoints: readonly T[],
  value: number,
): T | null {
  let closestBreakpoint: T | null = null

  for (const breakpoint of breakpoints) {
    if (breakpoint >= value) {
      if (closestBreakpoint !== null) {
        if (breakpoint < closestBreakpoint) {
          closestBreakpoint = breakpoint
        }
      } else {
        closestBreakpoint = breakpoint
      }
    }
  }

  return closestBreakpoint
}

export function isDeviceFormatValid(format: unknown): format is DeviceFormat {
  if (typeof format !== 'string') {
    return false
  }
  return DEVICE_FORMATS.some((x) => x === format)
}

export function isWidthBreakpointValid(width: number): width is WidthBreakpoint {
  return BREAKPOINTS.width.some((x) => x === width)
}

export function isHeightBreakpointValid(height: number): height is HeightBreakpoint {
  return BREAKPOINTS.height.some((x) => x === height)
}

export const DEVICE_CONTEXT_PATH_PARAM_PREFIX = 'r'

export function getIsDeviceContextPath(path: string): boolean {
  return path.startsWith(`/${DEVICE_CONTEXT_PATH_PARAM_PREFIX};`)
}

/**
 * Serializes a device context into the first path segment using Angular matrix
 * parameters (for example `r;format=mobile;width=768;height=820`).
 */
export function deviceContextToPathSegment(deviceContext: DeviceContext): string {
  const matrixParams = [`format=${deviceContext.format}`]
  const widthBreakpoint = !deviceContext.width
    ? null
    : findClosestWidthBreakpoint(deviceContext.width)
  const heightBreakpoint = !deviceContext.height
    ? null
    : findClosestHeightBreakpoint(deviceContext.height)

  if (widthBreakpoint !== null) {
    matrixParams.push(`width=${widthBreakpoint}`)
  }

  if (heightBreakpoint !== null) {
    matrixParams.push(`height=${heightBreakpoint}`)
  }

  return [DEVICE_CONTEXT_PATH_PARAM_PREFIX, ...matrixParams].join(';')
}

/**
 * Extracts the matrix parameter object from the first path segment when the
 * request path starts with the device context prefix (`/r;...`).
 *
 * Returns `null` for non-device paths or malformed matrix parameters.
 */
export function extractDeviceContextFromPath(
  path: string,
): Record<string, string> | null {
  if (!getIsDeviceContextPath(path)) {
    return null
  }

  const nextSegmentSeparatorIndex = path.indexOf('/', 1)
  const firstPathSegment =
    nextSegmentSeparatorIndex === -1
      ? path.slice(1)
      : path.slice(1, nextSegmentSeparatorIndex)

  if (!firstPathSegment) {
    return null
  }

  return parseMatrixParametersFromPathSegment(firstPathSegment)
}

function parseMatrixParametersFromPathSegment(
  pathSegment: string,
): Record<string, string> | null {
  const pathSegmentParts = pathSegment.split(';')
  if (pathSegmentParts.length < 2) {
    return null
  }

  const parsedMatrixParameters: Record<string, string> = {}

  for (let i = 1; i < pathSegmentParts.length; i++) {
    const parameter = pathSegmentParts[i]
    const separatorIndex = parameter.indexOf('=')
    if (separatorIndex < 1 || separatorIndex >= parameter.length - 1) {
      return null
    }

    const key = parameter.slice(0, separatorIndex)
    const value = parameter.slice(separatorIndex + 1)

    if (!key || !value) {
      return null
    }

    parsedMatrixParameters[key] = value
  }

  return parsedMatrixParameters
}

export function parseDeviceContext(
  deviceContext: Record<string, string>,
  schema: typeof DeviceContextSchema,
): Readonly<DeviceContext> | null

export function parseDeviceContext(
  deviceContext: Record<string, string>,
  schema: typeof LenientDeviceContextSchema,
): Readonly<LenientDeviceContext> | null

export function parseDeviceContext(
  deviceContext: Record<string, string>,
  schema: typeof DeviceContextSchema | typeof LenientDeviceContextSchema,
): Readonly<DeviceContext> | Readonly<LenientDeviceContext> | null {
  try {
    const parsed = Value.Parse(['Clone', 'Default', 'Convert'], schema, deviceContext)
    Value.Assert(schema, parsed)

    return Object.freeze(parsed)
  } catch (error) {
    if (!(error instanceof AssertError)) {
      console.warn(errorToString(error))
    }

    return null
  }
}
