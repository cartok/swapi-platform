export function formatDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs.toFixed(0)}ms`
  }

  const durationS = durationMs / 1000

  if (durationS < 60) {
    return `${durationS.toFixed(2)}s`
  }

  const durationM = durationS / 60

  return `${durationM.toFixed(2)}m`
}
