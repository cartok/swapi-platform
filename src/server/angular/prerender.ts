import '@angular/compiler'

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { ɵSERVER_CONTEXT } from '@angular/platform-server'
import { CommonEngine } from '@angular/ssr/node'

const [{ SSG_PATHS: PRERENDER_PATHS }, { default: bootstrap }] = await Promise.all([
  import('@/server/angular/app.routes.server'),
  import('@/server/angular/main.server'),
])

const angular = new CommonEngine({
  bootstrap,
  allowedHosts: ['localhost', '127.0.0.1', '::1'],
  providers: [{ provide: ɵSERVER_CONTEXT, useValue: 'ssg' }],
})

const serverDistFolder = dirname(fileURLToPath(import.meta.url))
const distFolder = resolve(serverDistFolder, '..')
const browserDistFolder = resolve(distFolder, 'client')
const indexHtmlPath = resolve(browserDistFolder, 'index.html')
// TODO: dotenv
const origin = process.env['PRERENDER_ORIGIN'] ?? 'http://localhost:4000'

for (const path of PRERENDER_PATHS) {
  const html = await angular.render({
    url: new URL(`/${path}`, origin).toString(),
    documentFilePath: indexHtmlPath,
    publicPath: browserDistFolder,
  })
  const outputFilePath = resolve(browserDistFolder, path, 'index.html')
  console.log(`SSG: Rendered <dist>/${path}/index.html`)
  await mkdir(dirname(outputFilePath), { recursive: true })
  await writeFile(outputFilePath, html, 'utf8')
}

console.log(`Prerendered ${PRERENDER_PATHS.length} routes into ${browserDistFolder}`)
