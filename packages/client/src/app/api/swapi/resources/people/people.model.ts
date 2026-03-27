import type { SwapiImageDataMock, SwapiResource } from '@/api/swapi/shared/types/model'

/**
 * A person within the Star Wars universe
 */
export interface Person extends SwapiResource {
  /**
   * The birth year of this person. BBY (Before the Battle of Yavin) or ABY (After the Battle
   * of Yavin).
   */
  readonly birthYear?: string
  /**
   * The eye color of this person.
   */
  readonly eyeColor?: string
  /**
   * IDs of film resources this person has been in.
   */
  readonly filmIds: string[]
  /**
   * The gender of this person (if known).
   */
  readonly gender?: string
  /**
   * The hair color of this person.
   */
  readonly hairColor?: string
  /**
   * The height of this person in meters.
   */
  readonly height?: string
  /**
   * ID of the planet resource this person was born on.
   */
  readonly homeworldId?: string
  /**
   * The mass of this person in kilograms.
   */
  readonly mass?: string
  /**
   * The name of this person.
   */
  readonly name: string
  /**
   * The skin color of this person.
   */
  readonly skinColor?: string
  /**
   * IDs of species resources this person belongs to.
   */
  readonly speciesIds: string[]
  /**
   * IDs of starship resources this person has piloted.
   */
  readonly starshipIds: string[]
  /**
   * IDs of vehicle resources this person has piloted.
   */
  readonly vehicleIds: string[]
  /**
   * Mock image URLs for this film.
   */
  readonly images: SwapiImageDataMock[]
}
