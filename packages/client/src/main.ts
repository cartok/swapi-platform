import '@/css/main.css'

import { bootstrapApplication } from '@angular/platform-browser'

import { App } from '@/app'
import { appConfigClient } from '@/app.config'

bootstrapApplication(App, appConfigClient).catch((err) => console.error(err))
