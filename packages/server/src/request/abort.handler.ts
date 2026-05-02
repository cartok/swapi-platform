import assert from 'node:assert'

import type { Context } from 'hono'

import { NO_STORE_CACHE_HEADERS } from '#internal/cache/cache'
import { GLOBAL_SWAPI_TARGET } from '#internal/env'
import type { Handler, HonoEnv } from '#internal/types'

const TIMEOUT_GLOBAL = 3500

export const addAbortHandler: Handler = (hono) => {
  hono.get('*', (c, next) => {
    const abortController = new HonoAbortController(c).addTimeout({
      duration: TIMEOUT_GLOBAL,
      label: 'Global Timeout',
    })

    c.set('abortController', abortController)

    return next()
  })
}

const ABORTED_BY_CLIENT_RESPONSE = new Response(null, {
  status: 499,
  headers: NO_STORE_CACHE_HEADERS,
})

const ABORTED_BY_TIMEOUT_RESPONSE = new Response(null, {
  status: 503,
  headers: NO_STORE_CACHE_HEADERS,
})

export function abortResponse(c: Context<HonoEnv>, codeLocation: string): Response {
  const abortController = c.get('abortController')

  if (!abortController.signal.aborted) {
    throw new Error(
      'Function missuse: Ensure that the abort controller has aborted first.',
    )
  }

  if (GLOBAL_SWAPI_TARGET !== 'production') {
    const info = {
      url: c.req.url,
      method: c.req.method,
      abortContext: {
        codeLocation,
        signalReason: (() => {
          if (abortController.signal.reason instanceof DOMException) {
            return abortController.signal.reason.toString()
          }
          return String(abortController.signal.reason)
        })(),
        ...abortController.abortContext,
      },
    }

    console.debug('Aborted request:', JSON.stringify(info))
  }

  assert(abortController.abortContext != null)

  switch (abortController.abortContext.source) {
    case 'client':
      return ABORTED_BY_CLIENT_RESPONSE
    case 'timeout':
      return ABORTED_BY_TIMEOUT_RESPONSE
  }
}

class HonoAbortController
  extends AbortController
  implements HonoAbortControllerInterface
{
  #abortContext: AbortContext | null = null

  get abortContext(): AbortContext | null {
    return this.#abortContext
  }

  constructor(c: Context<HonoEnv>) {
    super()
    this.addSignal(c.req.raw.signal, { source: 'client' })
  }

  addSignal(signal: AbortSignal, abortContext: AbortContext) {
    if (signal.aborted) {
      this.abortSignal(signal, abortContext)
    } else {
      signal.addEventListener('abort', () => this.abortSignal(signal, abortContext), {
        once: true,
      })
    }

    return this
  }

  addTimeout(timeout: TimeoutOptions) {
    const signal = AbortSignal.timeout(timeout.duration)

    this.addSignal(signal, { source: 'timeout', timeout })

    return this
  }

  private abortSignal(signal: AbortSignal, abortContext: AbortContext) {
    if (this.signal.aborted) {
      return
    }
    this.#abortContext = abortContext
    this.abort(signal.reason)
  }
}

export interface HonoAbortControllerInterface extends AbortController {
  readonly abortContext: AbortContext | null

  addSignal(signal: AbortSignal, abortContext: AbortContext): this

  addTimeout(timeout: TimeoutOptions): this
}

interface AbortContext {
  source: 'client' | 'timeout'
  timeout?: TimeoutOptions
}

interface TimeoutOptions {
  /**
   * Duration in millisecons.
   */
  duration: number
  label: string
}
