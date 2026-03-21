import './styles.css'

import { enableProdMode } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { isProdEnvironment } from '@swapi/shared/environment/is-prod'

import { App } from '@/app/app'
import { appConfig } from '@/app/app.config'

if (isProdEnvironment()) {
  enableProdMode()
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err))
