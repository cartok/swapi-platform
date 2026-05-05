import type { MultiSignalAbortController } from '#internal/signal/multi-signal-abort-controller'
import type { RenderJobId } from '#internal/ssr/render-worker.types'
import type {
  JobAbortReason,
  RenderWorkerPoolResponse,
} from '#internal/ssr/render-worker-pool.types'
import type { RenderWorkerSlot } from '#internal/ssr/render-worker-slot'

type RequestAbortReason = Exclude<JobAbortReason, 'render-timeout'>

interface RenderJobConfig {
  id: RenderJobId
  url: string
  requestController: MultiSignalAbortController
  resolve: (result: RenderWorkerPoolResponse) => void
  reject: (error: unknown) => void
  onAbort: (job: RenderJob, reason: RequestAbortReason) => void
  onQueueTimeout: (job: RenderJob) => void
  queueTimeoutMs: number
}

interface RenderJobSettleOptions {
  keepWorkerBusy?: boolean
}

export class RenderJob {
  settled = false

  readonly id: RenderJobId
  readonly url: string
  readonly requestController: MultiSignalAbortController

  abortReason?: JobAbortReason
  workerSlot?: RenderWorkerSlot

  readonly #abortOnRequestAbort: () => void
  readonly #resolve: (result: RenderWorkerPoolResponse) => void
  readonly #reject: (error: unknown) => void
  #queueTimeout: ReturnType<typeof setTimeout>
  #renderTimeout?: ReturnType<typeof setTimeout>
  #hardKillTimeout?: ReturnType<typeof setTimeout>

  constructor({
    id,
    url,
    requestController,
    resolve,
    reject,
    onAbort,
    onQueueTimeout,
    queueTimeoutMs,
  }: RenderJobConfig) {
    this.id = id
    this.url = url
    this.requestController = requestController
    this.#resolve = resolve
    this.#reject = reject

    this.#abortOnRequestAbort = () => {
      switch (requestController.abortContext.source) {
        case 'client':
          onAbort(this, 'client-abort')
          return
        case 'timeout':
          onAbort(this, 'request-timeout')
          return
      }
    }

    this.#queueTimeout = setTimeout(() => {
      onQueueTimeout(this)
    }, queueTimeoutMs)

    requestController.signal.addEventListener('abort', this.#abortOnRequestAbort, {
      once: true,
    })
  }

  clearQueueTimeout(): void {
    clearTimeout(this.#queueTimeout)
  }

  armRenderTimeout(timeoutMs: number, onTimeout: () => void): void {
    if (this.#renderTimeout) {
      clearTimeout(this.#renderTimeout)
    }

    this.#renderTimeout = setTimeout(onTimeout, timeoutMs)
  }

  armHardKillTimeout(timeoutMs: number, onTimeout: () => void): void {
    if (this.#hardKillTimeout) {
      clearTimeout(this.#hardKillTimeout)
    }

    this.#hardKillTimeout = setTimeout(onTimeout, timeoutMs)
  }

  teardownLifecycleHooks(): void {
    clearTimeout(this.#queueTimeout)

    if (this.#renderTimeout) {
      clearTimeout(this.#renderTimeout)
    }

    if (this.#hardKillTimeout) {
      clearTimeout(this.#hardKillTimeout)
    }

    this.requestController.signal.removeEventListener('abort', this.#abortOnRequestAbort)
  }

  settleResolved(
    result: RenderWorkerPoolResponse,
    options?: RenderJobSettleOptions,
  ): void {
    this.#settle(options)
    this.#resolve(result)
  }

  settleRejected(error: unknown, options?: RenderJobSettleOptions): void {
    this.#settle(options)
    this.#reject(error)
  }

  #settle(options?: RenderJobSettleOptions): void {
    if (this.settled) {
      throw new Error(`Tried to settle an already settled job ${this.id}.`)
    }

    this.settled = true
    this.teardownLifecycleHooks()

    if (!options?.keepWorkerBusy && this.workerSlot?.job?.id === this.id) {
      this.workerSlot.clearJob()
    }
  }
}
