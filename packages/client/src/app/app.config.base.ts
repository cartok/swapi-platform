import { LocationStrategy, NoTrailingSlashPathLocationStrategy } from '@angular/common'
import type { ApplicationConfig } from '@angular/core'
import {
  enableProdMode,
  inject,
  LOCALE_ID,
  provideEnvironmentInitializer,
} from '@angular/core'
import {
  provideClientHydration,
  withIncrementalHydration,
} from '@angular/platform-browser'

import { DeviceService } from '@/services/DeviceService'

if (VITE_MODE === 'production') {
  enableProdMode()
}

export const appConfigBase: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'en-US' },
    { provide: LocationStrategy, useClass: NoTrailingSlashPathLocationStrategy },
    provideClientHydration(withIncrementalHydration()),
    provideEnvironmentInitializer(() => inject(DeviceService)),
  ],
}
