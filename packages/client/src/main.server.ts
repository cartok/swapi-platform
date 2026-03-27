import { enableProdMode } from '@angular/core'
import type { BootstrapContext } from '@angular/platform-browser'
import { bootstrapApplication } from '@angular/platform-browser'

import { App } from '@/app'
import { config } from '@/app.config.server'

if (SWAPI_OUTPUT_MODE === 'production') {
  enableProdMode()
}

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, config, context)

export default bootstrap
