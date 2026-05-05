import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { indexHtmlPath, ssgDistPath } from '@swapi/client/dist-paths'
import { logEnv } from '@swapi/shared/environment/env'
import { PATHS } from '@swapi/shared/routing/paths'
import { SSG_PATHS } from '@swapi/shared/routing/ssg-paths'

import { enableAngularServerMode } from '#internal/angular/angular-server-mode'
import { allowedHosts, env } from '#internal/env'

logEnv(env, 'App Server SSG Environment Variables')

// Load Angular in correct order.
enableAngularServerMode()
await import('@angular/compiler')
const { CommonEngine } = await import('@angular/ssr/node')
const { ɵSERVER_CONTEXT } = await import('@angular/platform-server')
const { bootstrap } = await import('@swapi/client/main.server')
const angular = new CommonEngine({
  bootstrap,
  allowedHosts,
  providers: [{ provide: ɵSERVER_CONTEXT, useValue: 'ssg' }],
})

// Clear dist directory.
await rm(ssgDistPath, { force: true, recursive: true })

// Render SSG pages.
const origin = `http://${env.SWAPI_SERVER_HOST}:${env.SWAPI_SERVER_PORT}`
for (const path of SSG_PATHS) {
  const html = await angular.render({
    url: new URL(`/${path}`, origin).toString(),
    documentFilePath: indexHtmlPath,
  })
  const indexPath = path === PATHS.SSG.HOME_PATH ? './index.html' : `./${path}/index.html`
  const outputFilePath = resolve(ssgDistPath, indexPath)
  console.log('SSG: Rendered', indexPath.replace(/^\./, ''))
  await mkdir(dirname(outputFilePath), { recursive: true })
  await writeFile(outputFilePath, html, 'utf8')
}

console.log(`Prerendered ${String(SSG_PATHS.length)} routes into ${ssgDistPath}`)
