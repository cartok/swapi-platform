import type { Routes, UrlSegment } from '@angular/router'
import type { DeviceContext } from '@swapi/shared/device/context'
import {
  DEFAULT_DEVICE_FORMAT,
  DEVICE_CONTEXT_PATH_PARAM_PREFIX,
  deviceContextToPathSegment,
  findClosestHeightBreakpoint,
  findClosestWidthBreakpoint,
  isDeviceFormatValid,
  isHeightBreakpointValid,
  isWidthBreakpointValid,
  LenientDeviceContextSchema,
  parseDeviceContext,
} from '@swapi/shared/device/context'
import { ERROR_PATH, HOME_PATH } from '@swapi/shared/routing/paths'

const actualRoutes: Routes = [
  {
    path: HOME_PATH,
    loadComponent: () => import('@/pages/home/home').then(({ Home }) => Home),
    pathMatch: 'full',
  },
  {
    path: 'movies',
    loadComponent: () => import('@/pages/movies/movies').then(({ Movies }) => Movies),
  },
  {
    path: 'movie/:id',
    loadComponent: () => import('@/pages/movie/movie').then(({ Movie }) => Movie),
  },
  {
    path: 'characters',
    loadComponent: () =>
      import('@/pages/characters/characters').then(({ Characters }) => Characters),
  },
  {
    path: 'character/:id',
    loadComponent: () =>
      import('@/pages/character/character').then((component) => component.Character),
  },
  {
    path: 'planets',
    loadComponent: () => import('@/pages/planets/planets').then(({ Planets }) => Planets),
  },
  {
    path: 'planet/:id',
    loadComponent: () => import('@/pages/planet/planet').then(({ Planet }) => Planet),
  },
]

export const routes: Routes = [
  /**
   * This route is made to patch bad device parameters.
   *
   * It checks if the path has device parameters set, corrects the values to whats closest
   * and redirects to it. If the path had no device parameters, the router continues with
   * the next route.
   */
  {
    matcher(segments) {
      if (!segments.length) {
        return null
      }
      const firstSegment = segments[0]
      if (firstSegment.path !== DEVICE_CONTEXT_PATH_PARAM_PREFIX) {
        return null
      }
      const deviceContext = parseDeviceContext(
        firstSegment.parameters,
        LenientDeviceContextSchema,
      )
      if (!deviceContext) {
        console.error('Detected Device URL with bad or no context data.', firstSegment)
        return null
      }
      if (
        !isDeviceFormatValid(deviceContext.format) ||
        (deviceContext.width && !isWidthBreakpointValid(deviceContext.width)) ||
        (deviceContext.height && !isHeightBreakpointValid(deviceContext.height))
      ) {
        console.warn('Detected invalid width or height in device context.', deviceContext)
        return { consumed: [] }
      }
      return null
    },
    redirectTo(redirectData) {
      const firstSegment = redirectData.url[0]
      const deviceContext = parseDeviceContext(
        firstSegment.parameters,
        LenientDeviceContextSchema,
      )

      if (!deviceContext) {
        console.error(
          "Matcher should've already made sure that device context exists, but with invalid data.",
        )
        return '/error'
      }

      const actualPathSegments: UrlSegment[] = redirectData.url.slice(1)

      const validDeviceFormat = !isDeviceFormatValid(deviceContext.format)
        ? DEFAULT_DEVICE_FORMAT
        : deviceContext.format

      const validWidthBreakpoint =
        typeof deviceContext.width === 'undefined'
          ? undefined
          : (findClosestWidthBreakpoint(deviceContext.width) ?? undefined)

      const validHeightBreakpoint =
        typeof deviceContext.height === 'undefined'
          ? undefined
          : (findClosestHeightBreakpoint(deviceContext.height) ?? undefined)

      const correctedDeviceContext: DeviceContext = {
        format: validDeviceFormat,
        width: validWidthBreakpoint,
        height: validHeightBreakpoint,
      }

      const correctedFirstSegment = deviceContextToPathSegment(correctedDeviceContext)
      const correctedPath = actualPathSegments.length
        ? [
            correctedFirstSegment,
            ...actualPathSegments.map((segment) => segment.toString()),
          ].join('/')
        : correctedFirstSegment

      return `/${correctedPath}`
    },
  },
  {
    path: DEVICE_CONTEXT_PATH_PARAM_PREFIX,
    children: actualRoutes,
  },
  ...actualRoutes,
  {
    path: ERROR_PATH,
    loadComponent: () => import('@/pages/error/error').then(({ ErrorPage }) => ErrorPage),
  },
  {
    path: '**',
    redirectTo: `/${ERROR_PATH}`,
  },
]
