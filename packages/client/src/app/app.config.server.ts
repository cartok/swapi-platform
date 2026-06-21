import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import type { ApplicationConfig } from '@angular/core'
import { mergeApplicationConfig } from '@angular/core'
import { provideRouter, withRouterConfig } from '@angular/router'
import { provideServerRendering, withRoutes } from '@angular/ssr'

import { appConfigBase } from '@/app.config.base'
import { routes } from '@/app.routes'
import { serverRoutes } from '@/app.routes.server'
import { ssrAbortInterceptor } from '@/http/ssr-abort.interceptor'

const httpInterceptors = [ssrAbortInterceptor]
if (SWAPI_USE_MOCK) {
  const { swapiMockInterceptor } = await import('@/api/swapi/swapi.mock.interceptor')
  httpInterceptors.push(swapiMockInterceptor)
}

const config: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
    ),
    provideHttpClient(withFetch(), withInterceptors(httpInterceptors)),
  ],
}

export const appConfigServer = mergeApplicationConfig(appConfigBase, config)
