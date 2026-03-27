import type { SwapiResourceDto } from '@/api/swapi/shared/types/dto'

/**
 * A person within the Star Wars universe
 */
export interface PersonDto extends SwapiResourceDto {
  /**
   * The birth year of this person. BBY (Before the Battle of Yavin) or ABY (After the Battle
   * of Yavin).
   */
  readonly birth_year: string
  /**
   * The ISO 8601 date format of the time that this resource was created.
   */
  readonly created: string
  /**
   * The ISO 8601 date format of the time that this resource was edited.
   */
  readonly edited: string
  /**
   * The eye color of this person.
   */
  readonly eye_color: string
  /**
   * The film resources URLs that this person has been in.
   */
  readonly films: string[]
  /**
   * The gender of this person (if known).
   */
  readonly gender: string
  /**
   * The hair color of this person.
   */
  readonly hair_color: string
  /**
   * The height of this person in meters.
   */
  readonly height: string
  /**
   * The URL of the planet resource that this person was born on.
   */
  readonly homeworld: string
  /**
   * The mass of this person in kilograms.
   */
  readonly mass: string
  /**
   * The name of this person.
   */
  readonly name: string
  /**
   * The skin color of this person.
   */
  readonly skin_color: string
  /**
   * The species resource URLs of that this person is.
   */
  readonly species: string[]
  /**
   * The starship resource URLs that this person has piloted
   */
  readonly starships: string[]
  /**
   * The URL of this resource.
   */
  readonly url: string
  /**
   * The vehicle resource URLs that this person has piloted
   */
  readonly vehicles: string[]
}
