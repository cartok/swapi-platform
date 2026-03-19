import './styles.css'

import { enableProdMode } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'

import { App } from '@/app/app'
import { appConfig } from '@/app/app.config'
import { isProdEnvironment } from '@/shared/environment/is-prod'

if (isProdEnvironment()) {
  enableProdMode()
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err))
