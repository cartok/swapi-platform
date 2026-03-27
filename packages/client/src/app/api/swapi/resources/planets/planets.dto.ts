import type { SwapiResourceDto } from '@/api/swapi/shared/types/dto'

/**
 * A planet.
 */
export interface PlanetDto extends SwapiResourceDto {
  /**
   * The climate of this planet. Comma-seperated if diverse.
   */
  readonly climate: string
  /**
   * The ISO 8601 date format of the time that this resource was created.
   */
  readonly created: string
  /**
   * The diameter of this planet in kilometers.
   */
  readonly diameter: string
  /**
   * The ISO 8601 date format of the time that this resource was edited.
   */
  readonly edited: string
  /**
   * The film resource URLs that this planet has appeared in.
   */
  readonly films: string[]
  /**
   * A number denoting the gravity of this planet. Where 1 is normal.
   */
  readonly gravity: string
  /**
   * The name of this planet.
   */
  readonly name: string
  /**
   * The number of standard days it takes for this planet to complete a single orbit of its
   * local star.
   */
  readonly orbital_period: string
  /**
   * The average populationof sentient beings inhabiting this planet.
   */
  readonly population: string
  /**
   * The people resource URLs that live on this planet.
   */
  readonly residents: string[]
  /**
   * The number of standard hours it takes for this planet to complete a single rotation on
   * its axis.
   */
  readonly rotation_period: string
  /**
   * The percentage of the planet surface that is naturally occuring water or bodies of water.
   */
  readonly surface_water: string
  /**
   * the terrain of this planet. Comma-seperated if diverse.
   */
  readonly terrain: string
  /**
   * The URL of this resource.
   */
  readonly url: string
}
