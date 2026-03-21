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

import { httpRetryInterceptor } from '@/app/api/swapi/shared/http/http-retry.interceptor'
import { routes } from '@/app/app.routes'
import { DeviceService } from '@/app/services/DeviceService'

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'en-US' },
    provideZonelessChangeDetection(),
    { provide: LocationStrategy, useClass: NoTrailingSlashPathLocationStrategy },
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      }),
    ),
    provideEnvironmentInitializer(() => inject(DeviceService)),
    provideHttpClient(withFetch(), withInterceptors([httpRetryInterceptor])),
  ],
}
