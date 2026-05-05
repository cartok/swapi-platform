import { readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { Transferable } from 'node:worker_threads'
import { parentPort, threadId } from 'node:worker_threads'

import type { InjectionToken } from '@angular/core'
import type {
  CommonEngine as CommonEngineType,
  CommonEngineRenderOptions,
} from '@angular/ssr/node'
import { indexHtmlPath } from '@swapi/client/dist-paths'

import { enableAngularServerMode } from '#internal/angular/angular-server-mode'
import { allowedHosts } from '#internal/env'
import { toError } from '#internal/error/error'
import { toAbortReason } from '#internal/signal/signal'
import type {
  RenderJobId,
  WorkerAbortReason,
  WorkerAbortRequest,
  WorkerRenderRequest,
  WorkerRequest,
  WorkerResponse,
  WorkerWarmupRequest,
} from '#internal/ssr/render-worker.types'

interface SsrMainServerModule {
  bootstrap: NonNullable<CommonEngineRenderOptions['bootstrap']>
  SSR_ABORT_SIGNAL: InjectionToken<AbortSignal | null>
}

const port = parentPort

if (!port) {
  throw new Error(`The ${import.meta.file} file must be executed as a worker thread.`)
}

let job:
  | {
      id: RenderJobId
      url: string
      controller: AbortController
    }
  | undefined

enableAngularServerMode()

const angularSsrModulePromise = import('@angular/ssr/node')
const mainServerModulePromise: Promise<SsrMainServerModule> =
  import('@swapi/client/main.server')
const indexHtmlPromise = readFile(indexHtmlPath, 'utf8')

let indexHtml: string
let engine: CommonEngineType
let ssrAbortSignalToken: InjectionToken<AbortSignal | null>

port.on('message', handleMessage)

function handleMessage(message: WorkerRequest): void {
  switch (message.type) {
    case 'render':
      void handleRender(message)
      return

    case 'abort':
      handleAbort(message)
      return

    case 'warmup':
      void handleWarmup(message)
      return
  }
}

async function handleRender(message: WorkerRenderRequest): Promise<void> {
  if (job) {
    postToParent({
      type: 'render-error',
      threadId,
      id: message.id,
      error: new Error(`Worker is already rendering job ${job.id}.`),
    })

    return
  }

  job = {
    id: message.id,
    url: message.url,
    controller: new AbortController(),
  }

  try {
    const signal = job.controller.signal

    if (signal.aborted) {
      postToParent({
        type: 'render-aborted-by-signal',
        threadId,
        id: message.id,
        reason: toAbortReason(signal.reason),
      })
      return
    }

    const html = await engine.render({
      url: message.url,
      document: indexHtml,
      documentFilePath: indexHtmlPath,
      publicPath: dirname(indexHtmlPath),
      providers: [
        {
          provide: ssrAbortSignalToken,
          useValue: signal,
        },
      ],
    })

    if (signal.aborted) {
      postToParent({
        type: 'render-aborted-by-signal',
        threadId,
        id: message.id,
        reason: toAbortReason(signal.reason),
      })
    } else {
      postToParent({
        type: 'rendered',
        threadId,
        id: message.id,
        html,
      })
    }
  } catch (error) {
    postToParent({
      type: 'render-error',
      threadId,
      id: message.id,
      error: toError(error),
    })
  } finally {
    job = undefined
  }
}

function handleAbort(message: WorkerAbortRequest): void {
  if (!job || job.id !== message.id) {
    return
  }

  if (job.controller.signal.aborted) {
    return
  }

  job.controller.abort(createAbortReason(message.reason))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function handleWarmup(message: WorkerWarmupRequest): Promise<void> {
  try {
    await awaitDependencies()
    postToParent({
      type: 'warmed-up',
      threadId,
    })
  } catch (error) {
    postToParent({
      type: 'warmup-error',
      threadId,
      error: toError(error),
    })
  }
}

function postToParent(
  message: WorkerResponse,
  transferList?: readonly Transferable[],
): void {
  port!.postMessage(message, transferList)
}

async function awaitDependencies(): Promise<void> {
  const [{ CommonEngine }, { bootstrap, SSR_ABORT_SIGNAL }, document] = await Promise.all(
    [angularSsrModulePromise, mainServerModulePromise, indexHtmlPromise],
  )

  ssrAbortSignalToken = SSR_ABORT_SIGNAL

  engine = new CommonEngine({
    bootstrap,
    allowedHosts,
  })

  indexHtml = document
}

function createAbortReason(reason: WorkerAbortReason): DOMException {
  switch (reason) {
    case 'client-abort':
      return new DOMException('SSR render aborted by client.', 'AbortError')
    case 'request-timeout':
      return new DOMException('SSR request timeout reached.', 'TimeoutError')
    case 'render-timeout':
      return new DOMException('SSR render timeout reached.', 'TimeoutError')
  }
}
