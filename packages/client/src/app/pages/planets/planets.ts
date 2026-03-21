import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'

import type { Planet } from '@/app/api/swapi/resources/planets/planets.model'
import { PlanetsService } from '@/app/api/swapi/resources/planets/planets.service'
import { Heading } from '@/app/components/heading/heading'
import { ImageGrid } from '@/app/components/image-grid/image-grid'
import { ImageGridItem } from '@/app/components/image-grid/image-grid-item/image-grid-item'
import { DefaultPageLayout } from '@/app/layouts/default-page-layout/default-page-layout'
import { DeviceService } from '@/app/services/DeviceService'

@Component({
  selector: 'app-planets',
  imports: [Heading, ImageGrid, ImageGridItem, DefaultPageLayout],
  templateUrl: './planets.html',
  styleUrl: './planets.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Planets {
  readonly planetsService = inject(PlanetsService)
  readonly device = inject(DeviceService)
  readonly page = signal('1')
  readonly collection = this.planetsService.getCollection(this.page)

  imageTitle = (planet: Planet) => `Image of "${planet.name}"`
  linkUri = (planet: Planet) => `/planet/${planet.id}`
}
