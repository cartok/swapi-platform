import '@/css/main.css'

import { enableProdMode } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'

import { App } from '@/app'
import { appConfig } from '@/app.config'

if (SWAPI_OUTPUT_MODE === 'production') {
  enableProdMode()
}

bootstrapApplication(App, appConfig).catch((err) => console.error(err))
