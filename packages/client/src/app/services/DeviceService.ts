import { PlatformLocation } from '@angular/common'
import { computed, DestroyRef, DOCUMENT, inject, Injectable, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { NavigationEnd, PRIMARY_OUTLET, Router } from '@angular/router'
import type {
  DeviceContext,
  HeightBreakpoint,
  WidthBreakpoint,
} from '@swapi/shared/device/context'
import {
  BREAKPOINTS,
  DEFAULT_DEVICE_FORMAT,
  DEVICE_CONTEXT_PATH_PARAM_PREFIX,
  DeviceContextSchema,
  parseDeviceContext,
} from '@swapi/shared/device/context'
import { distinctUntilChanged, filter, map } from 'rxjs'

import { injectIsBrowser } from '@/shared/utils/platform'

interface DeviceQuery {
  format?: DeviceContext['format']
  maxWidth?: WidthBreakpoint
  maxHeight?: HeightBreakpoint
}

type DeviceFormatTokenMap = {
  readonly [Format in DeviceContext['format'] as Uppercase<Format>]: Format
}

type BreakpointTokenMap<Prefix extends string, Values extends readonly number[]> = {
  readonly [Value in Values[number] as `${Prefix}${Value}`]: Value
}

@Injectable({ providedIn: 'root' })
export class DeviceService {
  readonly FORMAT: DeviceFormatTokenMap = {
    DESKTOP: 'desktop',
    MOBILE: 'mobile',
    TABLET: 'tablet',
  }
  readonly WIDTH: BreakpointTokenMap<'W', typeof BREAKPOINTS.width> =
    createBreakpointTokenMap('W', BREAKPOINTS.width)
  readonly HEIGHT: BreakpointTokenMap<'H', typeof BREAKPOINTS.height> =
    createBreakpointTokenMap('H', BREAKPOINTS.height)

  private readonly destroyRef = inject(DestroyRef)
  private readonly platformLocation = inject(PlatformLocation)
  private readonly document = inject(DOCUMENT)
  private readonly isBrowser = injectIsBrowser()
  private readonly router = inject(Router)
  private initialized = false

  private readonly routeFormat = signal<DeviceContext['format']>(DEFAULT_DEVICE_FORMAT)
  private readonly routeWidth = signal<DeviceContext['width']>(undefined)
  private readonly routeHeight = signal<DeviceContext['height']>(undefined)

  private readonly maxWidthMatches = signal(
    createInitialBreakpointState(BREAKPOINTS.width),
  )
  private readonly maxHeightMatches = signal(
    createInitialBreakpointState(BREAKPOINTS.height),
  )

  readonly format = computed(() => this.routeFormat())
  readonly width = computed(() => {
    const viewportWidth = resolveMatchedBreakpoint(this.maxWidthMatches())
    return this.isBrowser && viewportWidth !== undefined
      ? viewportWidth
      : this.routeWidth()
  })
  readonly height = computed(() => {
    const viewportHeight = resolveMatchedBreakpoint(this.maxHeightMatches())
    return this.isBrowser && viewportHeight !== undefined
      ? viewportHeight
      : this.routeHeight()
  })

  readonly isMobile = computed(() => this.format() === this.FORMAT.MOBILE)
  readonly isTablet = computed(() => this.format() === this.FORMAT.TABLET)
  readonly isDesktop = computed(() => this.format() === this.FORMAT.DESKTOP)

  constructor() {
    if (this.initialized) {
      return
    }
    this.initialized = true
    this.setDeviceContextFromUrlPath(this.platformLocation.pathname)
    /**
     * Right now the route subscription is not really necessary as long as the app does not
     * maintain the device context path prefix during SPA navigation.
     */
    this.subscribeToRouterNavigation()
    this.subscribeToResize()
  }

  private subscribeToRouterNavigation(): void {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((urlPath) => {
        this.setDeviceContextFromUrlPath(urlPath)
      })
  }

  private setDeviceContextFromUrlPath(urlPath: string): void {
    const deviceContextMatrixParameters =
      this.extractDeviceContextMatrixParameters(urlPath)
    const deviceContext = !deviceContextMatrixParameters
      ? null
      : parseDeviceContext(deviceContextMatrixParameters, DeviceContextSchema)

    if (!deviceContext) {
      return
    }

    this.routeFormat.set(deviceContext.format)
    this.routeWidth.set(deviceContext.width)
    this.routeHeight.set(deviceContext.height)
  }

  is(criteria: DeviceQuery): boolean {
    if (criteria.format !== undefined && !this.isFormat(criteria.format)) {
      return false
    }

    if (criteria.maxWidth !== undefined && !this.isMaxWidth(criteria.maxWidth)) {
      return false
    }

    if (criteria.maxHeight !== undefined && !this.isMaxHeight(criteria.maxHeight)) {
      return false
    }

    return true
  }

  isFormat(format: DeviceContext['format']): boolean {
    return this.format() === format
  }

  isMaxWidth(breakpoint: WidthBreakpoint): boolean {
    if (this.isBrowser) {
      return this.maxWidthMatches()[breakpoint]
    }

    const routeWidth = this.routeWidth()
    return routeWidth !== undefined && routeWidth <= breakpoint
  }

  isMaxHeight(breakpoint: HeightBreakpoint): boolean {
    if (this.isBrowser) {
      return this.maxHeightMatches()[breakpoint]
    }

    const routeHeight = this.routeHeight()
    return routeHeight !== undefined && routeHeight <= breakpoint
  }

  private subscribeToResize(): void {
    if (!this.isBrowser || !this.document.defaultView) {
      return
    }

    for (const breakpoint of BREAKPOINTS.width) {
      const mediaQueryList = this.document.defaultView.matchMedia(
        `(max-width: ${breakpoint}px)`,
      )

      this.maxWidthMatches.update((state) => ({
        ...state,
        [breakpoint]: mediaQueryList.matches,
      }))

      const listener = () => {
        this.maxWidthMatches.update((state) => ({
          ...state,
          [breakpoint]: mediaQueryList.matches,
        }))
      }
      mediaQueryList.addEventListener('change', listener)
      this.destroyRef.onDestroy(() => {
        mediaQueryList.removeEventListener('change', listener)
      })
    }

    for (const breakpoint of BREAKPOINTS.height) {
      const mediaQueryList = this.document.defaultView.matchMedia(
        `(max-height: ${breakpoint}px)`,
      )

      this.maxHeightMatches.update((state) => ({
        ...state,
        [breakpoint]: mediaQueryList.matches,
      }))

      const listener = () => {
        this.maxHeightMatches.update((state) => ({
          ...state,
          [breakpoint]: mediaQueryList.matches,
        }))
      }
      mediaQueryList.addEventListener('change', listener)
      this.destroyRef.onDestroy(() => {
        mediaQueryList.removeEventListener('change', listener)
      })
    }
  }

  private extractDeviceContextMatrixParameters(
    urlPath: string,
  ): Record<string, string> | null {
    const urlTree = this.router.parseUrl(urlPath)
    if (!urlTree.root.hasChildren()) {
      return null
    }
    const urlSegments = urlTree.root.children[PRIMARY_OUTLET].segments
    if (!urlSegments.length) {
      return null
    }
    const firstSegment = urlSegments[0]
    if (firstSegment.path !== DEVICE_CONTEXT_PATH_PARAM_PREFIX) {
      return null
    }
    return firstSegment.parameters
  }
}

function createInitialBreakpointState<const Values extends readonly number[]>(
  breakpoints: Values,
): Record<Values[number], boolean> {
  return breakpoints.reduce(
    (acc, breakpoint) => ({ ...acc, [breakpoint]: false }),
    {} as Record<Values[number], boolean>,
  )
}

function createBreakpointTokenMap<
  const Prefix extends string,
  const Values extends readonly number[],
>(prefix: Prefix, breakpoints: Values): BreakpointTokenMap<Prefix, Values> {
  return Object.fromEntries(
    breakpoints.map((breakpoint) => [`${prefix}${breakpoint}`, breakpoint]),
  ) as BreakpointTokenMap<Prefix, Values>
}

function resolveMatchedBreakpoint<const Values extends readonly number[]>(
  state: Record<Values[number], boolean>,
): Values[number] | undefined {
  let matchedBreakpoint: Values[number] | undefined

  for (const [breakpoint, matches] of Object.entries(state)) {
    if (!matches) {
      continue
    }

    const numericBreakpoint = Number(breakpoint) as Values[number]
    if (matchedBreakpoint === undefined || numericBreakpoint < matchedBreakpoint) {
      matchedBreakpoint = numericBreakpoint
    }
  }

  return matchedBreakpoint
}
