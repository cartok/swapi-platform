import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import type { ApplicationConfig } from '@angular/core'
import { mergeApplicationConfig } from '@angular/core'
import { provideRouter, withRouterConfig } from '@angular/router'
import { provideServerRendering, withRoutes } from '@angular/ssr'

import { swapiMockInterceptor } from '@/api/swapi/swapi.mock.interceptor'
import { appConfigBase } from '@/app.config.base'
import { routes } from '@/app.routes'
import { serverRoutes } from '@/app.routes.server'
import { ssrAbortInterceptor } from '@/http/ssr-abort.interceptor'

// TODO: to be fixed, maybe after update to angular 22 + analogjs update
// import { ɵSERVER_CONTEXT } from '@angular/platform-server'

const config: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    // { provide: ɵSERVER_CONTEXT, useValue: 'ssg' },
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([ssrAbortInterceptor, swapiMockInterceptor]),
    ),
  ],
}

export const appConfigServer = mergeApplicationConfig(appConfigBase, config)
