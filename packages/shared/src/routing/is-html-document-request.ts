const DOCUMENT_REQUEST_EXCLUDED_FILES: ReadonlySet<string> = new Set([
  '/favicon.ico',
  '/robots.txt',
])

const DOCUMENT_REQUEST_EXCLUDED_PATHS: readonly string[] = [
  '/assets/',
  '/status/',
  '/debug/',
  '/.well-known/',
  '/cdn-cgi/',
]

export function isHtmlDocumentRequest({
  pathname,
  acceptHeader,
}: {
  pathname: string
  acceptHeader: string | undefined
}): boolean {
  if (!acceptHeader) {
    return false
  }

  if (!acceptHeader.includes('text/html')) {
    return false
  }

  for (const prefix of DOCUMENT_REQUEST_EXCLUDED_PATHS) {
    if (pathname.startsWith(prefix)) {
      return false
    }
  }

  if (DOCUMENT_REQUEST_EXCLUDED_FILES.has(pathname)) {
    return false
  }

  return true
}
