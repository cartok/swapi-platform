import { createMockFilmImages } from '@/api/swapi/resources/images.mock'
import type { PersonDto } from '@/api/swapi/resources/people/people.dto'
import type { Person } from '@/api/swapi/resources/people/people.model'
import {
  extractSwapiId,
  extractSwapiIdOptional,
  extractSwapiIds,
  toMandatoryString,
  toOptionalString,
} from '@/api/swapi/shared/utils/mapping'

export function mapPersonDtoToModel(dto: PersonDto): Person {
  const id = extractSwapiId(dto.url)
  const birthYear = toOptionalString(dto.birth_year)

  return {
    id,
    birthYear: mapBirthYear(birthYear),
    eyeColor: toOptionalString(dto.eye_color),
    filmIds: extractSwapiIds(dto.films),
    gender: toOptionalString(dto.gender),
    hairColor: toOptionalString(dto.hair_color),
    height: toOptionalString(dto.height),
    homeworldId: extractSwapiIdOptional(dto.homeworld),
    mass: toOptionalString(dto.mass),
    name: toMandatoryString(dto.name, 'name'),
    skinColor: toOptionalString(dto.skin_color),
    speciesIds: extractSwapiIds(dto.species),
    starshipIds: extractSwapiIds(dto.starships),
    vehicleIds: extractSwapiIds(dto.vehicles),
    images: createMockFilmImages('person', id, 3),
  }
}

function mapBirthYear(value?: string): string | undefined {
  if (value === undefined) {
    return undefined
  }

  return value.replace(/(\d+)(.*)/, '$1 $2').trim()
}
