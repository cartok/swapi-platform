import { enableProdMode } from '@angular/core'
import type { BootstrapContext } from '@angular/platform-browser'
import { bootstrapApplication } from '@angular/platform-browser'
import { isProdEnvironment } from '@swapi/shared/environment/is-prod'

import { App } from '@/app/app'
import { config } from '@/app/app.config.server'

if (isProdEnvironment()) {
  enableProdMode()
}

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, config, context)

export default bootstrap
