import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { map } from 'rxjs'

import { FilmsService } from '@/api/swapi/resources/films/films.service'
import { PeopleService } from '@/api/swapi/resources/people/people.service'
import { PlanetsService } from '@/api/swapi/resources/planets/planets.service'
import { CRITICAL_HTTP_RETRY_POLICY } from '@/api/swapi/shared/http/http-retry.interceptor'
import { Heading } from '@/components/heading/heading'
import { ImageSlider } from '@/components/image-slider/image-slider'
import { LabeledBox } from '@/components/labeled-box/labeled-box'
import { LinkList } from '@/components/link-list/link-list'
import { LinkListItem } from '@/components/link-list/link-list-item/link-list-item'
import { RowDescriptionList } from '@/components/row-description-list/row-description-list'
import { DetailPageLayout } from '@/layouts/detail-page-layout/detail-page-layout'
import type { InputValue } from '@/shared/types/component.types'

@Component({
  selector: 'app-planet',
  imports: [
    Heading,
    RowDescriptionList,
    ImageSlider,
    LinkList,
    LabeledBox,
    LinkListItem,
    DetailPageLayout,
  ],
  templateUrl: './planet.html',
  styleUrl: './planet.css',
  providers: [FilmsService, PeopleService, PlanetsService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Planet {
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly filmsService = inject(FilmsService)
  private readonly peopleService = inject(PeopleService)
  private readonly planetsService = inject(PlanetsService)

  readonly id = toSignal(this.route.paramMap.pipe(map((pm) => pm.get('id')!)), {
    initialValue: this.route.snapshot.paramMap.get('id')!,
  })
  readonly item = this.planetsService.getItem(this.id, {
    retryPolicy: CRITICAL_HTTP_RETRY_POLICY,
  })
  readonly residentIds = computed<string[]>(() => this.item.data()?.residentIds ?? [])
  readonly residents = this.peopleService.getItems(this.residentIds)
  readonly residentItems = computed(() => this.residents.data())
  readonly filmIds = computed<string[]>(() => this.item.data()?.filmIds ?? [])
  readonly films = this.filmsService.getItems(this.filmIds)
  readonly filmItems = computed(() => this.films.data())

  readonly descriptionRows = computed<InputValue<typeof RowDescriptionList, 'items'>>(
    () => {
      const data = this.item.data()
      if (!data) {
        return []
      }
      const rows = []
      if (data.diameter) {
        rows.push({ term: 'Diameter:', detail: data.diameter })
      }
      if (data.population) {
        rows.push({ term: 'Population:', detail: data.population })
      }
      if (data.climate) {
        rows.push({ term: 'Climate:', detail: data.climate })
      }
      if (data.terrain) {
        rows.push({ term: 'Terrain:', detail: data.terrain })
      }
      if (data.surfaceWater) {
        rows.push({ term: 'Surface Water:', detail: data.surfaceWater })
      }
      if (data.gravity) {
        rows.push({ term: 'Gravity:', detail: data.gravity })
      }
      if (data.orbitalPeriod) {
        rows.push({ term: 'Orbital Period:', detail: data.orbitalPeriod })
      }
      if (data.rotationPeriod) {
        rows.push({ term: 'Rotation Period:', detail: data.rotationPeriod })
      }
      return rows
    },
  )

  constructor() {
    effect(() => {
      if (this.item.status() === 'error') {
        void this.router.navigate(['/error'])
      }
    })
  }
}
