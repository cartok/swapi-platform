import '@angular/compiler'

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { ɵSERVER_CONTEXT } from '@angular/platform-server'
import { CommonEngine } from '@angular/ssr/node'
import { indexHtmlPath, ssgDistPath } from '@swapi/client/dist-paths'
import { HOME_PATH } from '@swapi/shared/routing/paths'
import { SSG_PATHS } from '@swapi/shared/routing/ssg-paths'

import { enableAngularServerMode } from '#internal/angular-server-mode'
import { env } from '#internal/env'

enableAngularServerMode()

const { default: bootstrap } = await import('@swapi/client/main.server')

const angular = new CommonEngine({
  bootstrap,
  providers: [{ provide: ɵSERVER_CONTEXT, useValue: 'ssg' }],
})

const origin = `http://${env.SWAPI_SERVER_HOST}:${env.SWAPI_SERVER_PORT}`

await rm(ssgDistPath, { force: true, recursive: true })

for (const path of SSG_PATHS) {
  const html = await angular.render({
    url: new URL(`/${path}`, origin).toString(),
    documentFilePath: indexHtmlPath,
  })
  const indexPath = path === HOME_PATH ? './index.html' : `./${path}/index.html`
  const outputFilePath = resolve(ssgDistPath, indexPath)
  console.log('SSG: Rendered', indexPath.replace(/^\./, ''))
  await mkdir(dirname(outputFilePath), { recursive: true })
  await writeFile(outputFilePath, html, 'utf8')
}

console.log(`Prerendered ${String(SSG_PATHS.length)} routes into ${ssgDistPath}`)
