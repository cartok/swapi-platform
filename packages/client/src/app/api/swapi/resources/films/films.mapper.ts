import type { FilmDto } from '@/api/swapi/resources/films/films.dto'
import type { Film } from '@/api/swapi/resources/films/films.model'
import { createMockFilmImages } from '@/api/swapi/resources/images.mock'
import {
  extractSwapiId,
  extractSwapiIds,
  toMandatoryString,
  toOptionalDate,
  toOptionalString,
  toRomanNumber,
} from '@/api/swapi/shared/utils/mapping'

export function mapFilmDtoToModel(dto: FilmDto): Film {
  const id = extractSwapiId(dto.url)
  return {
    id: id,
    characterIds: extractSwapiIds(dto.characters),
    director: toOptionalString(dto.director),
    episodeId: toOptionalString(toRomanNumber(dto.episode_id)),
    openingCrawl: toOptionalString(dto.opening_crawl),
    planetIds: extractSwapiIds(dto.planets),
    producer: toOptionalString(dto.producer),
    releaseDate: toOptionalDate(dto.release_date),
    speciesIds: extractSwapiIds(dto.species),
    starshipIds: extractSwapiIds(dto.starships),
    title: toMandatoryString(dto.title, 'title'),
    vehicleIds: extractSwapiIds(dto.vehicles),
    images: createMockFilmImages('film', id, 6),
  }
}
