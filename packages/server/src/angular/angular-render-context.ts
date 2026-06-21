import { readFile } from 'node:fs/promises'

import type { InjectionToken } from '@angular/core'
import type {
  CommonEngine as CommonEngineType,
  CommonEngineRenderOptions,
} from '@angular/ssr/node'
import { indexHtmlPath } from '@swapi/client/dist-paths'

import { enableAngularServerMode } from '#internal/angular/angular-server-mode'
import { allowedHosts } from '#internal/env'

enableAngularServerMode()

interface SsrMainServerModule {
  bootstrap: NonNullable<CommonEngineRenderOptions['bootstrap']>
  SSR_ABORT_SIGNAL: InjectionToken<AbortSignal | null>
}

const angularSsrModulePromise = import('@angular/ssr/node')
const mainServerModulePromise: Promise<SsrMainServerModule> =
  import('@swapi/client/main.server')
const indexHtmlPromise = readFile(indexHtmlPath, 'utf8')

let indexHtml: string
let engine: CommonEngineType
let ssrAbortSignalToken: InjectionToken<AbortSignal | null>

export interface AngularRenderingDependencies {
  indexHtml: string
  engine: CommonEngineType
  ssrAbortSignalToken: InjectionToken<AbortSignal | null>
}

interface AngularRenderContextConfig {
  ssg: boolean
}

async function awaitDependencies(config: AngularRenderContextConfig): Promise<void> {
  const [{ CommonEngine }, { bootstrap, SSR_ABORT_SIGNAL }, document] = await Promise.all(
    [angularSsrModulePromise, mainServerModulePromise, indexHtmlPromise],
  )

  ssrAbortSignalToken = SSR_ABORT_SIGNAL

  if (config.ssg) {
    const { ɵSERVER_CONTEXT } = await import('@angular/platform-server')
    engine = new CommonEngine({
      bootstrap,
      allowedHosts,
      providers: [{ provide: ɵSERVER_CONTEXT, useValue: 'ssg' }],
    })
  } else {
    engine = new CommonEngine({
      bootstrap,
      allowedHosts,
    })
  }

  indexHtml = document
}

export async function getAngularRenderContext(config: AngularRenderContextConfig) {
  await awaitDependencies({ ssg: config.ssg })

  return { indexHtml, engine, ssrAbortSignalToken } satisfies AngularRenderingDependencies
}
