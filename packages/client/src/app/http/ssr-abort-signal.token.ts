import { InjectionToken } from '@angular/core'

export const SSR_ABORT_SIGNAL = new InjectionToken<AbortSignal | null>(
  'SSR_ABORT_SIGNAL',
  {
    factory: () => null,
  },
)
