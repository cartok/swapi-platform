import type { SwapiImageDataMock, SwapiResource } from '@/api/swapi/shared/types/model'

/**
 * A Star Wars film
 */
export interface Film extends SwapiResource {
  /**
   * IDs of people resources featured within this film.
   */
  readonly characterIds: string[]
  /**
   * The director of this film.
   */
  readonly director?: string
  /**
   * The episode number of this film as roman number.
   */
  readonly episodeId?: string
  /**
   * The opening crawl text at the beginning of this film.
   */
  readonly openingCrawl?: string
  /**
   * IDs of planet resources featured within this film.
   */
  readonly planetIds: string[]
  /**
   * The producer(s) of this film.
   */
  readonly producer?: string
  /**
   * The release date at original creator country.
   */
  readonly releaseDate?: Date
  /**
   * IDs of species resources featured within this film.
   */
  readonly speciesIds: string[]
  /**
   * IDs of starship resources featured within this film.
   */
  readonly starshipIds: string[]
  /**
   * The title of this film.
   */
  readonly title: string
  /**
   * IDs of vehicle resources featured within this film.
   */
  readonly vehicleIds: string[]
  /**
   * Mock image URLs for this film.
   */
  readonly images: SwapiImageDataMock[]
}
