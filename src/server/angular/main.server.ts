import { enableProdMode } from '@angular/core'
import type { BootstrapContext } from '@angular/platform-browser'
import { bootstrapApplication } from '@angular/platform-browser'

import { App } from '@/app/app'
import { config } from '@/server/angular/app.config.server'

if (import.meta.env.PROD) {
  enableProdMode()
}

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, config, context)

export default bootstrap
