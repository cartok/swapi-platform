import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { indexHtmlPath, ssgDistPath } from '@swapi/client/dist-paths'
import { PATHS } from '@swapi/shared/routing/paths'
import { SSG_PATHS } from '@swapi/shared/routing/ssg-paths'

import { runEnv } from '#internal/env'
import { logServerEnv } from '#internal/log/log-env'
import { formatDuration } from '#internal/time'

await import('@angular/compiler')
const { getAngularRenderContext } =
  await import('#internal/angular/angular-render-context')
const { engine, indexHtml } = await getAngularRenderContext({ ssg: true })

export async function updateSsgPages(signal?: AbortSignal) {
  const startTime = performance.now()
  logServerEnv()

  signal?.throwIfAborted()
  await rm(ssgDistPath, { force: true, recursive: true })

  const origin = `http://${runEnv.RUN_HOST}:${runEnv.RUN_PORT}`

  for (const path of SSG_PATHS) {
    const renderStartTime = performance.now()

    signal?.throwIfAborted()
    const html = await engine.render({
      url: new URL(`/${path}`, origin).toString(),
      document: indexHtml,
      documentFilePath: indexHtmlPath,
    })
    signal?.throwIfAborted()

    const indexPath =
      path === PATHS.SSG.HOME_PATH ? './index.html' : `./${path}/index.html`
    const outputFilePath = resolve(ssgDistPath, indexPath)

    console.log('SSG: Rendered', indexPath.replace(/^\./, ''))
    const renderEndTime = performance.now()
    console.log('Took', formatDuration(renderEndTime - renderStartTime))

    await mkdir(dirname(outputFilePath), { recursive: true })
    await writeFile(outputFilePath, html, 'utf8')
  }

  console.log(`Prerendered ${String(SSG_PATHS.length)} routes into ${ssgDistPath}`)
  const endTime = performance.now()
  console.log('Took', formatDuration(endTime - startTime))
}
