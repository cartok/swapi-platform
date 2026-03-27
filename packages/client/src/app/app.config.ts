import { LocationStrategy, NoTrailingSlashPathLocationStrategy } from '@angular/common'
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http'
import type { ApplicationConfig } from '@angular/core'
import {
  inject,
  LOCALE_ID,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
} from '@angular/core'
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router'

import { httpRetryInterceptor } from '@/api/swapi/shared/http/http-retry.interceptor'
import { routes } from '@/app.routes'
import { DeviceService } from '@/services/DeviceService'

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    { provide: LOCALE_ID, useValue: 'en-US' },
    { provide: LocationStrategy, useClass: NoTrailingSlashPathLocationStrategy },
    provideEnvironmentInitializer(() => inject(DeviceService)),
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
