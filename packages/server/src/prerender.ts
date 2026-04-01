import '@angular/compiler'

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ɵSERVER_CONTEXT } from '@angular/platform-server'
import { CommonEngine } from '@angular/ssr/node'
import { SSG_PATHS } from '@swapi/shared/routing/ssg-paths'

import { CLIENT_DIST_FOLDER, CLIENT_DIST_FOLDER_URL, INDEX_HTML } from '##/client-dist'
import { env } from '##/env'

const { default: bootstrap } = await import('@swapi/client/main.server')

const angular = new CommonEngine({
  bootstrap,
  providers: [{ provide: ɵSERVER_CONTEXT, useValue: 'ssg' }],
})

const origin = `http://${env.SWAPI_HOST}:${env.SWAPI_PORT}`

for (const path of SSG_PATHS) {
  const html = await angular.render({
    url: new URL(`/${path}`, origin).toString(),
    documentFilePath: INDEX_HTML,
    publicPath: CLIENT_DIST_FOLDER,
  })
  const outputFilePath = fileURLToPath(
    new URL(`./${path}/index.html`, CLIENT_DIST_FOLDER_URL),
  )
  console.log(`SSG: Rendered /${path}/index.html`)
  await mkdir(dirname(outputFilePath), { recursive: true })
  await writeFile(outputFilePath, html, 'utf8')
}

console.log(`Prerendered ${String(SSG_PATHS.length)} routes into ${CLIENT_DIST_FOLDER}`)
