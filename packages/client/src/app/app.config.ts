import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import type { ApplicationConfig } from '@angular/core'
import { mergeApplicationConfig } from '@angular/core'
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router'

import { appConfigBase } from '@/app.config.base'
import { routes } from '@/app.routes'
import { httpRetryInterceptor } from '@/http/http-retry.interceptor'

const config: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
    ),
    provideHttpClient(withFetch(), withInterceptors([httpRetryInterceptor])),
  ],
}

export const appConfigClient = mergeApplicationConfig(appConfigBase, config)
