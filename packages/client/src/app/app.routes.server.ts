import type {
  ServerRoute,
  ServerRoutePrerender,
  ServerRoutePrerenderWithParams,
} from '@angular/ssr'
import { RenderMode } from '@angular/ssr'
import {
  DEVICE_CONTEXT_PATH_SEGMENTS,
  SSG_NON_VARIANT_PATHS,
  SSG_VARIANT_PATHS,
} from '@swapi/shared/routing/ssg-paths'

export const serverRoutes: ServerRoute[] = [
  ...SSG_NON_VARIANT_PATHS.map<ServerRoutePrerender>((path) => ({
    path,
    renderMode: RenderMode.Prerender,
  })),
  ...SSG_VARIANT_PATHS.flatMap((path) => [
    {
      path,
      renderMode: RenderMode.Prerender,
    } satisfies ServerRoutePrerender,
    {
      path: `:device-context/${path}`,
      renderMode: RenderMode.Prerender,
      getPrerenderParams() {
        return Promise.resolve(
          DEVICE_CONTEXT_PATH_SEGMENTS.map((path) => ({
            'device-context': path,
          })),
        )
      },
    } satisfies ServerRoutePrerenderWithParams,
  ]),
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
]
