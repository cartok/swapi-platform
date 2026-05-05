import type { BootstrapContext } from '@angular/platform-browser'
import { bootstrapApplication } from '@angular/platform-browser'

import { App } from '@/app'
import { appConfigServer } from '@/app.config.server'

export { SSR_ABORT_SIGNAL } from '@/http/ssr-abort-signal.token'

export const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, appConfigServer, context)
