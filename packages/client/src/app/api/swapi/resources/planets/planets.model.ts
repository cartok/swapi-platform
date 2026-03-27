import type { SwapiImageDataMock, SwapiResource } from '@/api/swapi/shared/types/model'

/**
 * A planet.
 */
export interface Planet extends SwapiResource {
  /**
   * The climate of this planet. Comma-seperated if diverse.
   */
  readonly climate?: string
  /**
   * The diameter of this planet in kilometers.
   */
  readonly diameter?: string
  /**
   * IDs of film resources this planet has appeared in.
   */
  readonly filmIds: string[]
  /**
   * A number denoting the gravity of this planet. Where 1 is normal.
   */
  readonly gravity?: string
  /**
   * The name of this planet.
   */
  readonly name: string
  /**
   * The number of standard days it takes for this planet to complete a single orbit of its
   * local star.
   */
  readonly orbitalPeriod?: string
  /**
   * The average populationof sentient beings inhabiting this planet.
   */
  readonly population?: string
  /**
   * IDs of people resources that live on this planet.
   */
  readonly residentIds: string[]
  /**
   * The number of standard hours it takes for this planet to complete a single rotation on
   * its axis.
   */
  readonly rotationPeriod?: string
  /**
   * The percentage of the planet surface that is naturally occuring water or bodies of water.
   */
  readonly surfaceWater?: string
  /**
   * the terrain of this planet. Comma-seperated if diverse.
   */
  readonly terrain?: string
  /**
   * Mock image URLs for this film.
   */
  readonly images: SwapiImageDataMock[]
}
