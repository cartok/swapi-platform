import type { MultiSignalAbortController } from '#internal/signal/multi-signal-abort-controller'
import { RenderJob } from '#internal/ssr/render-job'
import { RenderJobQueue } from '#internal/ssr/render-job-queue'
import type {
  RenderJobId,
  WorkerJobResponse,
  WorkerRenderAbortResponse,
  WorkerRenderErrorResponse,
  WorkerRenderResponse,
  WorkerResponse,
} from '#internal/ssr/render-worker.types'
import {
  RenderPoolClosedError,
  RenderQueueFullError,
  RenderQueueTimeoutError,
  RenderRequestTimeoutError,
  RenderTimeoutError,
} from '#internal/ssr/render-worker-pool.errors'
import type {
  JobAbortReason,
  RenderWorkerPoolConfig,
  RenderWorkerPoolResponse,
} from '#internal/ssr/render-worker-pool.types'
import { RenderWorkerSlot } from '#internal/ssr/render-worker-slot'

export class RenderWorkerPool {
  readonly #config: RenderWorkerPoolConfig

  #nextJobId = 0
  #workerSlots: RenderWorkerSlot[] = []
  #queue: RenderJobQueue
  #workerSlotRecoveryAttempts = new Map<number, number>()
  #workerSlotRecoveryTimers = new Map<number, ReturnType<typeof setTimeout>>()
  #closed = false

  private constructor(config: RenderWorkerPoolConfig) {
    if (config.workerRecoveryInitialBackoffMs <= 0) {
      throw new Error('workerRecoveryInitialBackoffMs must be > 0.')
    }

    if (config.workerRecoveryMaxBackoffMs < config.workerRecoveryInitialBackoffMs) {
      throw new Error(
        'workerRecoveryMaxBackoffMs must be >= workerRecoveryInitialBackoffMs.',
      )
    }

    if (config.workerRecoveryMaxAttempts < 1) {
      throw new Error('workerRecoveryMaxAttempts must be >= 1.')
    }

    if (config.workerRecoveryCooldownMs <= 0) {
      throw new Error('workerRecoveryCooldownMs must be > 0.')
    }

    this.#config = config
    this.#queue = new RenderJobQueue(config.maxQueuedJobs)
  }

  static async create(config: RenderWorkerPoolConfig): Promise<RenderWorkerPool> {
    const pool = new RenderWorkerPool(config)
    await pool.#startWorkerSlots()
    return pool
  }

  async #startWorkerSlots(): Promise<void> {
    for (let index = 0; index < this.#config.workerCount; index++) {
      this.#workerSlots.push(this.#createWorkerSlot(index))
    }

    await Promise.all(this.#workerSlots.map((workerSlot) => workerSlot.warmup()))
  }

  #createWorkerSlot(index: number): RenderWorkerSlot {
    return new RenderWorkerSlot({
      index,
      workerFile: this.#config.workerFile,
      onMessage: (workerSlot, message) => {
        this.#handleWorkerMessage(workerSlot, message)
      },
      onFailure: (workerSlot, error) => {
        this.#handleWorkerFailure(workerSlot, error)
      },
    })
  }

  async render({
    url,
    requestController,
  }: {
    url: string
    requestController: MultiSignalAbortController
  }): Promise<RenderWorkerPoolResponse> {
    if (this.#closed) {
      throw new RenderPoolClosedError()
    }

    const idleWorkerSlot = this.#findIdleWorkerSlot()

    if (!idleWorkerSlot) {
      if (!this.#hasEffectiveWorkerCapacity()) {
        throw new RenderQueueFullError()
      }

      if (this.#queue.isAtCapacity()) {
        throw new RenderQueueFullError()
      }
    }

    return new Promise<RenderWorkerPoolResponse>((resolve, reject) => {
      const job = this.#createJob({ url, requestController, resolve, reject })

      if (idleWorkerSlot) {
        this.#assignJobToWorkerSlot(job, idleWorkerSlot)
      } else {
        this.#queue.enqueue(job)
      }
    })
  }

  #createJob({
    url,
    requestController,
    resolve,
    reject,
  }: {
    url: string
    requestController: MultiSignalAbortController
    resolve: (result: RenderWorkerPoolResponse) => void
    reject: (error: unknown) => void
  }): RenderJob {
    return new RenderJob({
      id: this.#createJobId(),
      url,
      requestController,
      resolve,
      reject,
      onAbort: (job, reason) => {
        this.#abortJob(job, reason)
      },
      onQueueTimeout: (job) => {
        this.#queue.remove(job)
        if (job.settled) return
        job.settleRejected(new RenderQueueTimeoutError())
      },
      queueTimeoutMs: this.#config.queueTimeoutMs,
    })
  }

  #createJobId(): RenderJobId {
    if (this.#nextJobId >= Number.MAX_SAFE_INTEGER) {
      this.#nextJobId = 0
    }

    return ++this.#nextJobId
  }

  #drainQueue(): void {
    while (this.#queue.length > 0) {
      const idleWorkerSlot = this.#findIdleWorkerSlot()

      if (!idleWorkerSlot) return

      const job = this.#queue.dequeue()

      if (!job || job.settled) continue

      this.#assignJobToWorkerSlot(job, idleWorkerSlot)
    }
  }

  #assignJobToWorkerSlot(job: RenderJob, workerSlot: RenderWorkerSlot): void {
    job.clearQueueTimeout()

    workerSlot.assignJob(job)

    job.armRenderTimeout(this.#config.renderAbortTimeoutMs, () => {
      this.#abortJob(job, 'render-timeout')
    })

    workerSlot.post({
      type: 'render',
      id: job.id,
      url: job.url,
    })
  }

  #handleWorkerMessage(workerSlot: RenderWorkerSlot, message: WorkerResponse): void {
    switch (message.type) {
      case 'warmed-up':
        workerSlot.handleWarmedUp()
        this.#drainQueue()
        return

      case 'warmup-error':
        workerSlot.handleWarmupError(message.error)
        return

      case 'rendered':
        this.#handleRenderSuccessMessage(workerSlot, message)
        return

      case 'render-aborted-by-signal':
        this.#handleRenderAbortedBySignalMessage(workerSlot, message)
        return

      case 'render-error':
        this.#handleRenderErrorMessage(workerSlot, message)
        return
    }
  }

  #handleRenderSuccessMessage(
    workerSlot: RenderWorkerSlot,
    message: WorkerRenderResponse,
  ): void {
    const job = this.#resolveValidWorkerJob(workerSlot, message)
    if (!job) return

    workerSlot.clearJob()

    if (!job.settled) {
      job.settleResolved({
        kind: 'rendered',
        html: message.html,
      })
    } else {
      job.teardownLifecycleHooks()
    }

    this.#drainQueue()
  }

  #handleRenderAbortedBySignalMessage(
    workerSlot: RenderWorkerSlot,
    message: WorkerRenderAbortResponse,
  ): void {
    const job = this.#resolveValidWorkerJob(workerSlot, message)
    if (!job) return

    if (!job.settled) {
      switch (job.abortReason) {
        case 'client-abort':
          workerSlot.clearJob()
          job.settleResolved({ kind: 'aborted-client' })
          break

        case 'request-timeout':
          workerSlot.clearJob()
          job.settleRejected(new RenderRequestTimeoutError())
          break

        case 'render-timeout':
          workerSlot.clearJob()
          job.settleRejected(new RenderTimeoutError())
          break

        case undefined:
          this.#handleWorkerFailure(
            workerSlot,
            new Error(
              [
                `Undefined abort reason.`,
                `Worker ${workerSlot.index} aborted render job ${message.id}.`,
                `Message reason: ${String(message.reason)}`,
              ].join('\n'),
            ),
          )
          return
      }
    } else {
      workerSlot.clearJob()
      job.teardownLifecycleHooks()
    }

    this.#drainQueue()
  }

  #handleRenderErrorMessage(
    workerSlot: RenderWorkerSlot,
    message: WorkerRenderErrorResponse,
  ): void {
    const job = this.#resolveValidWorkerJob(workerSlot, message)
    if (!job) return

    workerSlot.clearJob()

    if (!job.settled) {
      job.settleRejected(message.error)
    } else {
      job.teardownLifecycleHooks()
    }

    this.#drainQueue()
  }

  #handleWorkerFailure(workerSlot: RenderWorkerSlot, error: unknown): void {
    this.#config.metrics.workerFailures++

    workerSlot.rejectWarmup(error)

    const job = workerSlot.job

    if (job && !job.settled) {
      job.settleRejected(error)
    }

    this.#scheduleWorkerSlotRecovery(workerSlot)
    this.#failQueuedJobsIfNoEffectiveCapacity()
  }

  #resolveValidWorkerJob(
    workerSlot: RenderWorkerSlot,
    message: WorkerJobResponse,
  ): RenderJob | undefined {
    const job = workerSlot.job

    if (job?.id !== message.id) {
      this.#handleWorkerFailure(
        workerSlot,
        new Error(
          [
            `Worker ${workerSlot.index} returned ${message.type} for unknown job ${message.id}.`,
            `Worker thread id is ${message.threadId}.`,
          ].join('\n'),
        ),
      )
      return
    }

    return job
  }

  #abortJob(job: RenderJob, reason: JobAbortReason): void {
    if (job.settled) return

    job.abortReason = reason

    switch (reason) {
      case 'client-abort':
        this.#config.metrics.clientAborts++
        break

      case 'request-timeout':
        this.#config.metrics.requestTimeoutAborts++
        break

      case 'render-timeout':
        this.#config.metrics.renderTimeoutAborts++
        break
    }

    const assignedWorkerSlot = job.workerSlot

    if (assignedWorkerSlot) {
      assignedWorkerSlot.post({
        type: 'abort',
        id: job.id,
        reason,
      })

      switch (reason) {
        case 'client-abort':
          job.settleResolved({ kind: 'aborted-client' }, { keepWorkerBusy: true })
          break

        case 'request-timeout':
          job.settleRejected(new RenderRequestTimeoutError(), { keepWorkerBusy: true })
          break

        case 'render-timeout':
          job.settleRejected(new RenderTimeoutError(), { keepWorkerBusy: true })
          break
      }

      let hardKillTimeoutMs: number
      switch (reason) {
        case 'render-timeout':
          hardKillTimeoutMs = this.#config.renderTimeoutWorkerGraceMs
          break

        case 'client-abort':
        case 'request-timeout':
          hardKillTimeoutMs = this.#config.requestAbortWorkerGraceMs
          break
      }

      job.armHardKillTimeout(hardKillTimeoutMs, () => {
        if (assignedWorkerSlot.job?.id === job.id) {
          void this.#replaceWorkerSlot(assignedWorkerSlot)
        }
      })
    } else {
      this.#queue.remove(job)

      switch (reason) {
        case 'client-abort':
          job.settleResolved({ kind: 'aborted-client' })
          break

        case 'request-timeout':
          job.settleRejected(new RenderRequestTimeoutError())
          break

        case 'render-timeout':
          job.settleRejected(new RenderTimeoutError())
          break
      }
    }
  }

  #scheduleWorkerSlotRecovery(workerSlot: RenderWorkerSlot): void {
    if (this.#closed) return

    const { index: slotIndex } = workerSlot
    this.#clearWorkerRecoveryTimer(slotIndex)

    const attempt = (this.#workerSlotRecoveryAttempts.get(slotIndex) ?? 0) + 1
    const shouldCooldown = attempt > this.#config.workerRecoveryMaxAttempts
    const attemptForBackoff = shouldCooldown ? 1 : attempt

    this.#workerSlotRecoveryAttempts.set(slotIndex, attemptForBackoff)

    const delayMs = shouldCooldown
      ? this.#config.workerRecoveryCooldownMs
      : Math.min(
          this.#config.workerRecoveryInitialBackoffMs * 2 ** (attemptForBackoff - 1),
          this.#config.workerRecoveryMaxBackoffMs,
        )

    const workerRecoveryTimer = setTimeout(() => {
      this.#workerSlotRecoveryTimers.delete(slotIndex)

      if (this.#closed) return

      const currentWorkerSlot = this.#workerSlots[slotIndex]
      if (!currentWorkerSlot) return

      void this.#replaceWorkerSlot(currentWorkerSlot)
    }, delayMs)

    this.#workerSlotRecoveryTimers.set(slotIndex, workerRecoveryTimer)
  }

  #clearWorkerRecoveryTimer(slotIndex: number): void {
    const workerRecoveryTimer = this.#workerSlotRecoveryTimers.get(slotIndex)
    if (!workerRecoveryTimer) return

    clearTimeout(workerRecoveryTimer)
    this.#workerSlotRecoveryTimers.delete(slotIndex)
  }

  async #replaceWorkerSlot(workerSlot: RenderWorkerSlot): Promise<void> {
    this.#clearWorkerRecoveryTimer(workerSlot.index)
    await this.#terminateWorkerSlot(workerSlot)

    if (this.#closed) return

    this.#config.metrics.workerRestarts++
    const newWorkerSlot = this.#createWorkerSlot(workerSlot.index)
    this.#workerSlots[workerSlot.index] = newWorkerSlot

    try {
      await newWorkerSlot.warmup()
      this.#workerSlotRecoveryAttempts.delete(newWorkerSlot.index)
      this.#drainQueue()
    } catch (error) {
      newWorkerSlot.handleWarmupError(error)
      this.#scheduleWorkerSlotRecovery(newWorkerSlot)
      this.#failQueuedJobsIfNoEffectiveCapacity()
    }
  }

  async #terminateWorkerSlot(workerSlot: RenderWorkerSlot): Promise<void> {
    const wasRunning = workerSlot.state !== 'dead' && workerSlot.state !== 'terminating'

    if (wasRunning) {
      this.#config.metrics.workerTerminations++
    }

    const job = workerSlot.job

    if (job && !job.settled) {
      job.settleRejected(new Error(`Worker ${workerSlot.index} was terminated.`))
    }

    workerSlot.job = undefined

    await workerSlot.terminate()
  }

  #failQueuedJobsIfNoEffectiveCapacity(): void {
    if (this.#hasEffectiveWorkerCapacity()) return

    for (const job of this.#queue.drain()) {
      if (job.settled) continue
      job.settleRejected(new RenderQueueFullError())
    }
  }

  #findIdleWorkerSlot(): RenderWorkerSlot | undefined {
    return this.#workerSlots.find((workerSlot) => workerSlot.state === 'idle')
  }

  #hasEffectiveWorkerCapacity(): boolean {
    return this.#workerSlots.some(
      (workerSlot) => workerSlot.state !== 'dead' && workerSlot.state !== 'terminating',
    )
  }

  async close(): Promise<void> {
    this.#closed = true
    this.#workerSlotRecoveryAttempts.clear()

    for (const workerRecoveryTimer of this.#workerSlotRecoveryTimers.values()) {
      clearTimeout(workerRecoveryTimer)
    }
    this.#workerSlotRecoveryTimers.clear()

    for (const job of this.#queue.drain()) {
      if (job.settled) continue
      job.settleRejected(new RenderPoolClosedError())
    }

    await Promise.allSettled(
      this.#workerSlots.map((workerSlot) => this.#terminateWorkerSlot(workerSlot)),
    )
  }
}
