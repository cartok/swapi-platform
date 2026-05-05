import type { RenderJob } from '#internal/ssr/render-job'

export class RenderJobQueue {
  readonly #maxQueuedJobs: number
  #jobs: RenderJob[] = []

  constructor(maxQueuedJobs: number) {
    this.#maxQueuedJobs = maxQueuedJobs
  }

  get length(): number {
    return this.#jobs.length
  }

  isAtCapacity(): boolean {
    return this.#jobs.length >= this.#maxQueuedJobs
  }

  enqueue(job: RenderJob): void {
    this.#jobs.push(job)
  }

  dequeue(): RenderJob | undefined {
    return this.#jobs.shift()
  }

  remove(job: RenderJob): void {
    const queueIndex = this.#jobs.indexOf(job)

    if (queueIndex >= 0) {
      this.#jobs.splice(queueIndex, 1)
    }
  }

  drain(): RenderJob[] {
    return this.#jobs.splice(0)
  }
}
