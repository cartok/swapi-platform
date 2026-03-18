import type { ServerRoute } from '@angular/ssr'
import { RenderMode } from '@angular/ssr'

import { BREAKPOINTS } from '@/shared/device/context'
import { DEVICE_FORMATS, deviceContextToPathSegment } from '@/shared/device/context'

const deviceContextVariantPathSet = new Set<string>()
for (const deviceFormat of DEVICE_FORMATS) {
  deviceContextVariantPathSet.add(deviceContextToPathSegment({ format: deviceFormat }))

  for (const width of BREAKPOINTS.width) {
    deviceContextVariantPathSet.add(
      deviceContextToPathSegment({ format: deviceFormat, width }),
    )
  }

  for (const height of BREAKPOINTS.height) {
    deviceContextVariantPathSet.add(
      deviceContextToPathSegment({ format: deviceFormat, height }),
    )
  }

  for (const width of BREAKPOINTS.width) {
    for (const height of BREAKPOINTS.height) {
      deviceContextVariantPathSet.add(
        deviceContextToPathSegment({ format: deviceFormat, width, height }),
      )
    }
  }
}

export const DEVICE_CONTEXT_VARIANT_PATHS: readonly string[] = Object.freeze([
  ...deviceContextVariantPathSet,
])

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: ':device-context',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return DEVICE_CONTEXT_VARIANT_PATHS.map((deviceContextPathParam) => ({
        'device-context': deviceContextPathParam,
      }))
    },
  },
  {
    path: 'error',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
]
