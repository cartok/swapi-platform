import '@angular/compiler'

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ɵSERVER_CONTEXT } from '@angular/platform-server'
import { CommonEngine } from '@angular/ssr/node'
import { SSG_PATHS } from '@swapi/shared/routing/ssg-paths'

const { default: bootstrap } = await import('@swapi/client/main.server')

const angular = new CommonEngine({
  bootstrap,
  allowedHosts: ['localhost', '127.0.0.1', '::1'],
  providers: [{ provide: ɵSERVER_CONTEXT, useValue: 'ssg' }],
})

const scriptDir = dirname(fileURLToPath(import.meta.url))
const clientDistFolder = resolve(
  scriptDir,
  '../../client/dist/production/production/browser',
)
const indexHtml = resolve(clientDistFolder, 'index.html')
const origin = 'http://localhost:4000'

for (const path of SSG_PATHS) {
  const html = await angular.render({
    url: new URL(`/${path}`, origin).toString(),
    documentFilePath: indexHtml,
    publicPath: clientDistFolder,
  })
  const outputFilePath = resolve(clientDistFolder, path, 'index.html')
  console.log(`SSG: Rendered /${path}/index.html`)
  await mkdir(dirname(outputFilePath), { recursive: true })
  await writeFile(outputFilePath, html, 'utf8')
}

console.log(`Prerendered ${String(SSG_PATHS.length)} routes into ${clientDistFolder}`)
