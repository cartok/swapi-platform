import { provideHttpClient, withFetch } from '@angular/common/http'
import type { ApplicationConfig } from '@angular/core'
import { mergeApplicationConfig } from '@angular/core'
import { provideRouter, withRouterConfig } from '@angular/router'
import { provideServerRendering, withRoutes } from '@angular/ssr'

import { appConfigBase } from '@/app.config.base'
import { routes } from '@/app.routes'
import { serverRoutes } from '@/app.routes.server'

const config: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    provideRouter(
      routes,
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
    ),
    provideHttpClient(withFetch()),
  ],
}

export const appConfigServer = mergeApplicationConfig(appConfigBase, config)
