export class RenderQueueFullError extends Error {
  constructor() {
    super('Render queue is full')
    this.name = 'RenderQueueFullError'
  }
}

export class RenderQueueTimeoutError extends Error {
  constructor() {
    super('Render queue timeout')
    this.name = 'RenderQueueTimeoutError'
  }
}

export class RenderRequestTimeoutError extends Error {
  constructor() {
    super('Render request timeout')
    this.name = 'RenderRequestTimeoutError'
  }
}

export class RenderTimeoutError extends Error {
  constructor() {
    super('Render timeout')
    this.name = 'RenderTimeoutError'
  }
}

export class RenderPoolClosedError extends Error {
  constructor() {
    super('Render worker pool is closed')
    this.name = 'RenderPoolClosedError'
  }
}
