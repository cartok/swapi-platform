import type { FileExtension } from '#internal/cache/file-extensions'
import {
  AUDIO_FILE_EXTENSION_SET,
  DATA_FILE_EXTENSION_SET,
  FILE_EXTENSION_SET,
  FONT_FILE_EXTENSION_SET,
  IMAGE_FILE_EXTENSION_SET,
  SCRIPT_FILE_EXTENSION_SET,
  STYLE_FILE_EXTENSION_SET,
  VIDEO_FILE_EXTENSION_SET,
} from '#internal/cache/file-extensions'

type CacheHeaders = Record<string, string>

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
  DATA: 'data',
} as const)

type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]
type CacheTags = readonly CacheTag[]

/**
 * Info: Cache-Tag header is actually only important for HTML documents and for unhashed assets.
 */
export const fileExtensionCacheTagHeadersMap = new Map<FileExtension, CacheHeaders>()

for (const fileExtension of FILE_EXTENSION_SET) {
  if (IMAGE_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagHeadersMap.set(
      fileExtension,
      createCacheTagsHeader([CACHE_TAGS.ASSET, CACHE_TAGS.MEDIA, CACHE_TAGS.IMAGE]),
    )
  } else if (VIDEO_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagHeadersMap.set(
      fileExtension,
      createCacheTagsHeader([CACHE_TAGS.ASSET, CACHE_TAGS.MEDIA, CACHE_TAGS.VIDEO]),
    )
  } else if (AUDIO_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagHeadersMap.set(
      fileExtension,
      createCacheTagsHeader([CACHE_TAGS.ASSET, CACHE_TAGS.MEDIA, CACHE_TAGS.AUDIO]),
    )
  } else if (FONT_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagHeadersMap.set(
      fileExtension,
      createCacheTagsHeader([CACHE_TAGS.ASSET, CACHE_TAGS.FONT]),
    )
  } else if (STYLE_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagHeadersMap.set(
      fileExtension,
      createCacheTagsHeader([CACHE_TAGS.STYLE]),
    )
  } else if (SCRIPT_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagHeadersMap.set(
      fileExtension,
      createCacheTagsHeader([CACHE_TAGS.SCRIPT]),
    )
  } else if (DATA_FILE_EXTENSION_SET.has(fileExtension)) {
    fileExtensionCacheTagHeadersMap.set(
      fileExtension,
      createCacheTagsHeader([CACHE_TAGS.DATA]),
    )
  } else {
    throw new Error(`File extension ${fileExtension} is not assigned.`)
  }
}

function createCacheTagsHeader(tags: CacheTags): CacheHeaders {
  return { 'Cache-Tag': tags.join(',') }
}
