import type { RenderResult } from '#internal/ssr/render-worker.types'

export interface RenderWorkerPoolMetrics {
  workerFailures: number
  workerRestarts: number
  workerTerminations: number
  clientAborts: number
  requestTimeoutAborts: number
  renderTimeoutAborts: number
}

export interface RenderWorkerPoolConfig {
  /**
   * ESM URL of the worker entry file.
   **/
  workerFile: URL
  /**
   * Number of render workers in the pool.
   **/
  workerCount: number
  /**
   * Maximum number of jobs waiting in queue while all workers are busy.
   **/
  maxQueuedJobs: number
  /**
   * Maximum queue waiting time before the job fails with queue-timeout.
   **/
  queueTimeoutMs: number
  /**
   * Soft render deadline after which the job is aborted as render-timeout.
   **/
  renderAbortTimeoutMs: number
  /**
   * Grace period after request aborts (client disconnect or global request timeout)
   * before force-replacing a still-stuck worker.
   */
  requestAbortWorkerGraceMs: number
  /**
   * Grace period after internal render-timeouts before force-replacing a still-stuck worker.
   */
  renderTimeoutWorkerGraceMs: number
  /**
   * Initial delay for worker recovery retries after worker start/warmup failures.
   */
  workerRecoveryInitialBackoffMs: number
  /**
   * Maximum delay for worker recovery retries.
   */
  workerRecoveryMaxBackoffMs: number
  /**
   * Maximum consecutive worker recovery attempts before cooldown is applied.
   */
  workerRecoveryMaxAttempts: number
  /**
   * Cooldown delay before restarting worker recovery attempts after max attempts were reached.
   */
  workerRecoveryCooldownMs: number
  /**
   * Mutable runtime counters used for health/debug metrics.
   **/
  metrics: RenderWorkerPoolMetrics
}

export type JobAbortReason = 'client-abort' | 'request-timeout' | 'render-timeout'

interface RenderedResponse {
  kind: 'rendered'
  html: RenderResult
}

interface ClientAbortedResponse {
  kind: 'aborted-client'
}

export type RenderWorkerPoolResponse = RenderedResponse | ClientAbortedResponse
