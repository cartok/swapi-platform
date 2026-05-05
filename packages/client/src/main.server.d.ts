import type { ApplicationRef, InjectionToken } from '@angular/core'
import type { BootstrapContext } from '@angular/platform-browser'

export function bootstrap(context: BootstrapContext): Promise<ApplicationRef>
export const SSR_ABORT_SIGNAL: InjectionToken<AbortSignal | null>
