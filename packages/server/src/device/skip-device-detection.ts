import type { Context } from 'hono'

export function skipDeviceDetection(c: Context): boolean {
  if (c.req.header('X-Skip-Device-Detection') === 'true') {
    console.info('Skipping device detection.')
    return true
  }
  return false
}
