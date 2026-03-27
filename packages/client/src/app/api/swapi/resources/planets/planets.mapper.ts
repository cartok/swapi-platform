import { createMockFilmImages } from '@/api/swapi/resources/images.mock'
import type { PlanetDto } from '@/api/swapi/resources/planets/planets.dto'
import type { Planet } from '@/api/swapi/resources/planets/planets.model'
import {
  extractSwapiId,
  extractSwapiIds,
  toMandatoryString,
  toOptionalString,
} from '@/api/swapi/shared/utils/mapping'

export function mapPlanetDtoToModel(dto: PlanetDto): Planet {
  const id = extractSwapiId(dto.url)
  return {
    id,
    climate: toOptionalString(dto.climate),
    diameter: toOptionalString(dto.diameter),
    filmIds: extractSwapiIds(dto.films),
    gravity: toOptionalString(dto.gravity),
    name: toMandatoryString(dto.name, 'name'),
    orbitalPeriod: toOptionalString(dto.orbital_period),
    population: toOptionalString(dto.population),
    residentIds: extractSwapiIds(dto.residents),
    rotationPeriod: toOptionalString(dto.rotation_period),
    surfaceWater: toOptionalString(dto.surface_water),
    terrain: toOptionalString(dto.terrain),
    images: createMockFilmImages('person', id, 3),
  }
}
