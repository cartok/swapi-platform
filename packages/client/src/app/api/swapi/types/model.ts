/**
 * Base interface for all SWAPI resource model collections.
 */
export interface SwapiResourceCollection<T extends SwapiResource> {
  /**
   * Total entries (page size = 10).
   * This value does not represent the number of resources in the actual payload / is the same for every page.
   */
  count?: number
  /**
   * Full URL to the next page, if any.
   * Property does not exist at all, if there is only one page (<= 10 resources).
   */
  next?: string
  /**
   * Full URL to the previous page, if any.
   * Property does not exist at all, if there is only one page (<= 10 resources).
   */
  previous?: string
  items: T[]
}

/**
 * Base interface for all SWAPI resource models.
 */
export interface SwapiResource {
  /**
   * Extracted from the resource `url` field (e.g. ".../people/1/" -> "1").
   */
  readonly id: string
}

export interface SwapiImageDataMock {
  url: string
  alt: string
  width: number
  height: number
}
