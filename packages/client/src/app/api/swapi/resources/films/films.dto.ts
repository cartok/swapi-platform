import type { SwapiResourceDto } from '@/api/swapi/shared/types/dto'

/**
 * A Star Wars film
 */
export interface FilmDto extends SwapiResourceDto {
  /**
   * The people resource URLs featured within this film.
   */
  readonly characters: string[]
  /**
   * The ISO 8601 date format of the time that this resource was created.
   */
  readonly created: string
  /**
   * The director of this film.
   */
  readonly director: string
  /**
   * the ISO 8601 date format of the time that this resource was edited.
   */
  readonly edited: string
  /**
   * The episode number of this film.
   */
  readonly episode_id: number
  /**
   * The opening crawl text at the beginning of this film.
   */
  readonly opening_crawl: string
  /**
   * The planet resource URLs featured within this film.
   */
  readonly planets: string[]
  /**
   * The producer(s) of this film.
   */
  readonly producer: string
  /**
   * The release date at original creator country.
   */
  readonly release_date: string
  /**
   * The species resource URLs featured within this film.
   */
  readonly species: string[]
  /**
   * The starship resource URLs featured within this film.
   */
  readonly starships: string[]
  /**
   * The title of this film.
   */
  readonly title: string
  /**
   * The URL of this resource.
   */
  readonly url: string
  /**
   * The vehicle resource URLs featured within this film.
   */
  readonly vehicles: string[]
}
