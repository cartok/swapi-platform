import { connect } from 'node:tls'

const DEFAULT_TLS_TIMEOUT_MS = 2000

export async function runTlsCertificateHealthCheck({
  host,
  timeoutMs = DEFAULT_TLS_TIMEOUT_MS,
}: {
  host: string
  timeoutMs?: number
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const socket = connect({
      host,
      port: 443,
      rejectUnauthorized: true,
    })

    let isSettled = false
    const settle = (action: () => void): void => {
      if (isSettled) {
        return
      }

      isSettled = true
      socket.destroy()
      action()
    }

    socket.setTimeout(timeoutMs, () => {
      settle(() => {
        reject(new Error(`TLS certificate check timed out for ${host}.`))
      })
    })

    socket.once('secureConnect', () => {
      settle(resolve)
    })

    socket.once('error', (error: Error) => {
      settle(() => {
        reject(error)
      })
    })
  })
}
