export function isFileRequestPath(pathname: string): boolean {
  try {
    return /\.[a-zA-Z0-9]+$/.test(decodeURIComponent(pathname))
  } catch {
    return /\.[a-zA-Z0-9]+$/.test(pathname)
  }
}
