export interface SwapiResourceCollectionDto<T extends SwapiResourceDto> {
  /**
   * Total entries (page size = 10).
   * This value does not represent the number of resources in the actual payload / is the same for every page.
   */
  count: number
  /**
   * Full URL to the next page, if any.
   * Property does not exist at all, if there is only one page (<= 10 resources).
   */
  next?: string | null
  /**
   * Full URL to the previous page, if any.
   * Property does not exist at all, if there is only one page (<= 10 resources).
   */
  previous?: string | null
  results: T[]
}

export interface SwapiResourceDto {
  /**
   * The ISO 8601 date format of the time that this resource was created.
   */
  readonly created: string
  /**
   * The ISO 8601 date format of the time that this resource was edited.
   */
  readonly edited: string
  /**
   * The URL of this resource.
   */
  readonly url: string
}
