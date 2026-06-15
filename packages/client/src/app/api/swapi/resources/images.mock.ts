import type { SwapiImageDataMock as SwapiImageMock } from '@/api/swapi/types/model'

export function createMockFilmImages(
  resourceName: string,
  resourceId: string,
  amount: number,
  width = 700,
  height = 400,
): SwapiImageMock[] {
  return Array.from({ length: amount }).map((_, i) => ({
    url: `https://picsum.photos/seed/swapi-${resourceName}-${resourceId}-${i}/${width}/${height}`,
    alt: `Mock image ${i + 1}`,
    width,
    height,
  }))
}
