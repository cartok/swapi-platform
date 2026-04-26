export const CACHE_TAGS = Object.freeze({
  ASSET: 'asset',
  AUDIO: 'audio',
  FONT: 'font',
  HTML: 'html',
  IMAGE: 'image',
  MEDIA: 'media',
  SCRIPT: 'script',
  SSG: 'ssg',
  SSR: 'ssr',
  STYLE: 'style',
  VIDEO: 'video',
} as const)

type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]
type CacheTags = readonly CacheTag[]

const AUDIO_FILE_EXTENSION_LIST = [] as const
const FONT_FILE_EXTENSION_LIST = ['woff2'] as const
const IMAGE_FILE_EXTENSION_LIST = ['ico', 'jpg', 'png', 'svg'] as const
const SCRIPT_FILE_EXTENSION_LIST = ['js'] as const
const STYLE_FILE_EXTENSION_LIST = ['css'] as const
const VIDEO_FILE_EXTENSION_LIST = [] as const

const SCRIPT_AND_STYLE_FILE_EXTENSION_LIST = [
  ...SCRIPT_FILE_EXTENSION_LIST,
  ...STYLE_FILE_EXTENSION_LIST,
] as const

const MEDIA_FILE_EXTENSION_LIST = [
  ...AUDIO_FILE_EXTENSION_LIST,
  ...IMAGE_FILE_EXTENSION_LIST,
  ...VIDEO_FILE_EXTENSION_LIST,
] as const

const ASSET_FILE_EXTENSION_LIST = [
  ...MEDIA_FILE_EXTENSION_LIST,
  ...FONT_FILE_EXTENSION_LIST,
] as const

const FILE_EXTENSION_LIST = [
  ...SCRIPT_AND_STYLE_FILE_EXTENSION_LIST,
  ...ASSET_FILE_EXTENSION_LIST,
] as const

type FileExtension = (typeof FILE_EXTENSION_LIST)[number]

const FILE_EXTENSION_SET = new Set(FILE_EXTENSION_LIST)

export function isRegisteredFileExtension(value: string): value is FileExtension {
  return FILE_EXTENSION_SET.has(value as FileExtension)
}

export const IMAGE_FILE_EXTENSION_SET = new Set<FileExtension>(IMAGE_FILE_EXTENSION_LIST)
export const VIDEO_FILE_EXTENSION_SET = new Set<FileExtension>(VIDEO_FILE_EXTENSION_LIST)
export const AUDIO_FILE_EXTENSION_SET = new Set<FileExtension>(AUDIO_FILE_EXTENSION_LIST)
export const FONT_FILE_EXTENSION_SET = new Set<FileExtension>(FONT_FILE_EXTENSION_LIST)
export const STYLE_FILE_EXTENSION_SET = new Set<FileExtension>(STYLE_FILE_EXTENSION_LIST)
export const SCRIPT_FILE_EXTENSION_SET = new Set<FileExtension>(
  SCRIPT_FILE_EXTENSION_LIST,
)
export const ASSET_FILE_EXTENSION_SET = new Set<FileExtension>(ASSET_FILE_EXTENSION_LIST)

const fileExtensionCacheTagsMap = new Map<FileExtension, CacheTags>()
for (const fileExtension of FILE_EXTENSION_LIST) {
  if (IMAGE_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagsMap.set(fileExtension, [
      CACHE_TAGS.ASSET,
      CACHE_TAGS.MEDIA,
      CACHE_TAGS.IMAGE,
    ] as const)
  } else if (VIDEO_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagsMap.set(fileExtension, [
      CACHE_TAGS.ASSET,
      CACHE_TAGS.MEDIA,
      CACHE_TAGS.VIDEO,
    ] as const)
  } else if (AUDIO_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagsMap.set(fileExtension, [
      CACHE_TAGS.ASSET,
      CACHE_TAGS.MEDIA,
      CACHE_TAGS.AUDIO,
    ] as const)
  } else if (FONT_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagsMap.set(fileExtension, [
      CACHE_TAGS.ASSET,
      CACHE_TAGS.FONT,
    ] as const)
  } else if (STYLE_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagsMap.set(fileExtension, [CACHE_TAGS.STYLE] as const)
  } else if (SCRIPT_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagsMap.set(fileExtension, [CACHE_TAGS.SCRIPT] as const)
  } else {
    throw new Error(`File extension ${fileExtension} is not assigned.`)
  }
}

export type CacheHeaders = Record<string, string>

export const DOCUMENT_CACHE_HEADERS: CacheHeaders = Object.freeze({
  'Cache-Control': toCacheControlValue(['public', 'max-age=0', 'must-revalidate']),
  'CDN-Cache-Control': toCacheControlValue([
    'public',
    's-maxage=172800',
    'stale-while-revalidate=1800',
  ]),
})

export const HASHED_FILE_CACHE_HEADERS: CacheHeaders = Object.freeze({
  'Cache-Control': toCacheControlValue(['public', 'max-age=31536000', 'immutable']),
  'CDN-Cache-Control': toCacheControlValue(['public', 's-maxage=31536000', 'immutable']),
})

export const UNHASHED_SCRIPT_AND_STYLE_CACHE_HEADERS: CacheHeaders = {
  'Cache-Control': toCacheControlValue(['public', 'max-age=0', 'must-revalidate']),
  'CDN-Cache-Control': toCacheControlValue([
    'public',
    's-maxage=172800',
    'stale-while-revalidate=3600',
  ]),
}

export const UNHASHED_MEDIA_CACHE_HEADERS: CacheHeaders = {
  'Cache-Control': toCacheControlValue(['public', 'max-age=86400']),
  'CDN-Cache-Control': toCacheControlValue([
    'public',
    's-maxage=172800',
    'stale-while-revalidate=3600',
  ]),
}

export const NO_STORE_CACHE_HEADERS: CacheHeaders = {
  'Cache-Control': 'no-store',
  'CDN-Cache-Control': 'no-store',
} as const

function toCacheControlValue(directives: readonly string[]): string {
  return directives.join(', ')
}

export function withCacheTagHeader({
  cacheControlHeaders,
  fileExtension,
}: {
  cacheControlHeaders: CacheHeaders
  fileExtension: FileExtension
}): CacheHeaders {
  const cacheTags = fileExtensionCacheTagsMap.get(fileExtension)!
  return {
    ...cacheControlHeaders,
    ...createCacheTagsHeader(cacheTags),
  }
}

function createCacheTagsHeader(tags: CacheTags): CacheHeaders {
  return { 'Cache-Tag': tags.join(',') }
}
