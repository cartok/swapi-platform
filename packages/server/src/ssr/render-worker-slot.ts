import type { Transferable } from 'node:worker_threads'
import { Worker } from 'node:worker_threads'

import type { RenderJob } from '#internal/ssr/render-job'
import type { WorkerRequest, WorkerResponse } from '#internal/ssr/render-worker.types'

type RenderWorkerSlotState =
  | 'starting'
  | 'warming'
  | 'idle'
  | 'busy'
  | 'terminating'
  | 'dead'

interface RenderWorkerSlotConfig {
  index: number
  workerFile: URL
  onMessage: (workerSlot: RenderWorkerSlot, message: WorkerResponse) => void
  onFailure: (workerSlot: RenderWorkerSlot, error: unknown) => void
}

export class RenderWorkerSlot {
  readonly index: number
  readonly worker: Worker

  state: RenderWorkerSlotState = 'starting'
  job?: RenderJob

  #warmupResolve?: () => void
  #warmupReject?: (error: unknown) => void
  #terminatePromise?: Promise<void>

  constructor({ index, workerFile, onMessage, onFailure }: RenderWorkerSlotConfig) {
    this.index = index
    this.worker = new Worker(workerFile)

    this.worker.once('online', () => {
      this.#handleOnline()
    })

    this.worker.on('message', (message: WorkerResponse) => {
      onMessage(this, message)
    })

    this.worker.on('error', (error) => {
      onFailure(this, error)
    })

    this.worker.on('exit', (exitCode) => {
      if (this.state !== 'terminating' && this.state !== 'dead') {
        onFailure(
          this,
          new Error(`Render worker exited unexpectedly with code ${exitCode}`),
        )
      }

      this.state = 'dead'
    })
  }

  warmup(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.#warmupResolve = resolve
      this.#warmupReject = reject
    })
  }

  handleWarmedUp(): void {
    this.state = 'idle'
    this.#warmupResolve?.()
    this.#warmupResolve = undefined
    this.#warmupReject = undefined
  }

  handleWarmupError(error: unknown): void {
    this.state = 'dead'
    this.#warmupReject?.(error)
    this.#warmupReject = undefined
    this.#warmupResolve = undefined
  }

  rejectWarmup(error: unknown): void {
    this.#warmupReject?.(error)
  }

  assignJob(job: RenderJob): void {
    job.workerSlot = this
    this.job = job
    this.state = 'busy'
  }

  clearJob(): void {
    this.job = undefined
    this.state = 'idle'
  }

  post(message: WorkerRequest, transferList?: readonly Transferable[]): void {
    this.worker.postMessage(message, transferList)
  }

  async terminate(): Promise<void> {
    if (this.state === 'dead') {
      return
    }

    if (this.#terminatePromise) {
      return this.#terminatePromise
    }

    this.state = 'terminating'

    this.#terminatePromise = (async () => {
      try {
        await this.worker.terminate()
      } finally {
        this.state = 'dead'
        this.#terminatePromise = undefined
      }
    })()

    return this.#terminatePromise
  }

  #handleOnline(): void {
    if (this.state === 'starting') {
      this.state = 'warming'
      this.post({ type: 'warmup' })
      return
    }

    console.warn(
      [
        `Worker was in an unexpected state when it came online.`,
        `Expected state is 'starting', actual state is ${this.state}.`,
        `This might have happened by a race condition.`,
      ].join('\n'),
    )
  }
}
