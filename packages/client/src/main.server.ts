import type { BootstrapContext } from '@angular/platform-browser'
import { bootstrapApplication } from '@angular/platform-browser'

import { App } from '@/app'
import { appConfigServer } from '@/app.config.server'

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(App, appConfigServer, context)

export default bootstrap
