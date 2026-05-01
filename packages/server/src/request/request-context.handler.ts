import { readdirSync } from 'node:fs'

import { browserDistPath } from '@swapi/client/dist-paths'

import type { Handler } from '#internal/types'

export const addRequestContextHandler: Handler = (hono) => {
  hono.get('*', (c, next) => {
    const isDocumentRequest = isHtmlDocumentRequest({
      pathname: c.req.path,
      acceptHeader: c.req.header('Accept'),
    })

    c.set('isHtmlDocumentRequest', isDocumentRequest)
    return next()
  })
}

const STATIC_DIRECTORY_EXCLUDED_PREFIXES: readonly string[] =
  resolveStaticDirectoryExcludedPrefixes()

const DOCUMENT_REQUEST_EXCLUDED_PATHS: ReadonlySet<string> = new Set([
  '/favicon.ico',
  '/robots.txt',
])

const DOCUMENT_REQUEST_EXCLUDED_PREFIXES: readonly string[] = [
  ...STATIC_DIRECTORY_EXCLUDED_PREFIXES,
  '/.well-known/',
  '/cdn-cgi/',
  '/debug/',
  '/status/',
]

function isHtmlDocumentRequest({
  pathname,
  acceptHeader,
}: {
  pathname: string
  acceptHeader: string | undefined
}): boolean {
  if (isExcludedDocumentPath(pathname)) {
    return false
  }

  if (isFileRequestPath(pathname)) {
    return false
  }

  return hasHtmlAcceptHeader(acceptHeader)
}

function isFileRequestPath(pathname: string): boolean {
  try {
    return /\.[a-zA-Z0-9]+$/.test(decodeURIComponent(pathname))
  } catch {
    return /\.[a-zA-Z0-9]+$/.test(pathname)
  }
}

function isExcludedDocumentPath(pathname: string): boolean {
  if (DOCUMENT_REQUEST_EXCLUDED_PATHS.has(pathname)) {
    return true
  }

  for (const prefix of DOCUMENT_REQUEST_EXCLUDED_PREFIXES) {
    if (pathname.startsWith(prefix)) {
      return true
    }
  }

  return false
}

function hasHtmlAcceptHeader(acceptHeader: string | undefined): boolean {
  if (!acceptHeader) {
    return false
  }

  const normalizedAcceptHeader = acceptHeader.toLowerCase()

  return (
    normalizedAcceptHeader.includes('text/html') ||
    normalizedAcceptHeader.includes('application/xhtml+xml')
  )
}

function resolveStaticDirectoryExcludedPrefixes(): readonly string[] {
  const prefixes: string[] = []
  const entries = readdirSync(browserDistPath, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue
    }

    prefixes.push(`/${entry.name}/`)
  }

  return prefixes
}
