import assert from 'node:assert'

import type { Context, Env } from 'hono'

type AbortContext = ClientAbortContext | TimeoutAbortContext

type ClientAbortContext = AbortContextType<{ source: 'client' }>

type TimeoutAbortContext = AbortContextType<{
  source: 'timeout'
  timeout: TimeoutOptions
}>

type AbortContextType<T extends { source: string }> = T

interface TimeoutOptions {
  durationMs: number
  label: string
}

export class MultiSignalAbortController extends AbortController {
  #abortContext: AbortContext | null = null

  get abortContext(): AbortContext {
    assert(this.signal.aborted)
    assert(this.#abortContext !== null)
    return this.#abortContext
  }

  static createFromHonoContext<THonoEnv extends Env>(
    c: Context<THonoEnv>,
  ): MultiSignalAbortController {
    const controller = new MultiSignalAbortController().addSignal(c.req.raw.signal, {
      source: 'client',
    })

    return controller
  }

  addSignal(signal: AbortSignal, abortContext: AbortContext) {
    if (signal.aborted) {
      this.#abort(signal, abortContext)
    } else {
      signal.addEventListener('abort', () => this.#abort(signal, abortContext), {
        once: true,
      })
    }

    return this
  }

  addTimeout(timeout: TimeoutOptions) {
    const signal = AbortSignal.timeout(timeout.durationMs)

    this.addSignal(signal, { source: 'timeout', timeout })

    return this
  }

  #abort(signal: AbortSignal, abortContext: AbortContext) {
    if (this.signal.aborted) {
      return
    }
    // Order is important here.
    this.#abortContext = abortContext
    this.abort(signal.reason)
  }
}
