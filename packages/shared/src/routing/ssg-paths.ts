import {
  BREAKPOINTS,
  DEVICE_FORMATS,
  deviceContextToPathSegment,
} from '##/device/context'
import { ERROR_PATH, HOME_PATH } from '##/routing/path'

export const DEVICE_CONTEXT_PATH_SEGMENTS: readonly string[] =
  createDeviceContextPathSegments()
export const SSG_NON_VARIANT_PATHS: readonly string[] = Object.freeze([ERROR_PATH])
export const SSG_VARIANT_PATHS: readonly string[] = Object.freeze([HOME_PATH])
export const SSG_PATHS: readonly string[] = Object.freeze([
  ...SSG_NON_VARIANT_PATHS,
  ...SSG_VARIANT_PATHS.flatMap((path) => [
    path,
    ...DEVICE_CONTEXT_PATH_SEGMENTS.map((deviceContextPath) => {
      switch (path) {
        case HOME_PATH:
          return deviceContextPath
        default:
          return `${deviceContextPath}/${path}`
      }
    }),
  ]),
])
console.log(SSG_PATHS)

function createDeviceContextPathSegments(): readonly string[] {
  const paths = new Set<string>()
  for (const format of DEVICE_FORMATS) {
    paths.add(deviceContextToPathSegment({ format }))
    for (const width of BREAKPOINTS.width) {
      paths.add(deviceContextToPathSegment({ format, width }))
      for (const height of BREAKPOINTS.height) {
        paths.add(deviceContextToPathSegment({ format, height }))
        paths.add(deviceContextToPathSegment({ format, width, height }))
      }
    }
  }

  return Object.freeze([...paths])
}
