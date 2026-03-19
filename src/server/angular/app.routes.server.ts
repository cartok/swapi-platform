import type {
  ServerRoute,
  ServerRoutePrerender,
  ServerRoutePrerenderWithParams,
} from '@angular/ssr'
import { RenderMode } from '@angular/ssr'

import { BREAKPOINTS } from '@/shared/device/context'
import { DEVICE_FORMATS, deviceContextToPathSegment } from '@/shared/device/context'

const deviceContextPaths = new Set<string>()
for (const deviceFormat of DEVICE_FORMATS) {
  deviceContextPaths.add(deviceContextToPathSegment({ format: deviceFormat }))

  for (const width of BREAKPOINTS.width) {
    deviceContextPaths.add(deviceContextToPathSegment({ format: deviceFormat, width }))
  }

  for (const height of BREAKPOINTS.height) {
    deviceContextPaths.add(deviceContextToPathSegment({ format: deviceFormat, height }))
  }

  for (const width of BREAKPOINTS.width) {
    for (const height of BREAKPOINTS.height) {
      deviceContextPaths.add(
        deviceContextToPathSegment({ format: deviceFormat, width, height }),
      )
    }
  }
}

const DEVICE_CONTEXT_PATHS: readonly string[] = Object.freeze([...deviceContextPaths])
const SSG_BASE_PATHS: readonly string[] = Object.freeze(['', 'error'])

export const SSG_PATHS: readonly string[] = Object.freeze(
  SSG_BASE_PATHS.flatMap((path) => [
    path,
    ...DEVICE_CONTEXT_PATHS.map((deviceContextPath) =>
      path ? `${deviceContextPath}/${path}` : deviceContextPath,
    ),
  ]),
)

export const serverRoutes: ServerRoute[] = [
  ...SSG_BASE_PATHS.flatMap((path) => [
    {
      path,
      renderMode: RenderMode.Prerender,
    } satisfies ServerRoutePrerender,
    {
      path: `:device-context/${path}`,
      renderMode: RenderMode.Prerender,
      async getPrerenderParams() {
        return DEVICE_CONTEXT_PATHS.map((path) => ({
          'device-context': path,
        }))
      },
    } satisfies ServerRoutePrerenderWithParams,
  ]),
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
]
