import type express from 'express'

export function getRequestCookie(req: express.Request, key: string): unknown {
  const cookies = req.cookies as Record<string, unknown>

  return cookies[key]
}
