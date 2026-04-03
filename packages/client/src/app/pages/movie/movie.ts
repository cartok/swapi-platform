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
  selector: 'app-movie',
  imports: [
    Heading,
    RowDescriptionList,
    ImageSlider,
    LinkList,
    LabeledBox,
    LinkListItem,
    DetailPageLayout,
  ],
  templateUrl: './movie.html',
  styleUrl: './movie.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Movie {
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly filmsService = inject(FilmsService)
  private readonly planetsService = inject(PlanetsService)
  private readonly peopleService = inject(PeopleService)

  readonly id = toSignal(this.route.paramMap.pipe(map((pm) => pm.get('id')!)), {
    initialValue: this.route.snapshot.paramMap.get('id')!,
  })
  readonly item = this.filmsService.getItem(this.id, {
    retryPolicy: CRITICAL_HTTP_RETRY_POLICY,
  })
  readonly characterIds = computed<string[]>(() => this.item.data()?.characterIds ?? [])
  readonly characters = this.peopleService.getItems(this.characterIds)
  readonly characterItems = computed(() => this.characters.data())
  readonly planetIds = computed<string[]>(() => this.item.data()?.planetIds ?? [])
  readonly planets = this.planetsService.getItems(this.planetIds)
  readonly planetItems = computed(() => this.planets.data())

  readonly descriptionRows = computed<InputValue<typeof RowDescriptionList, 'items'>>(
    () => {
      const data = this.item.data()
      if (!data) {
        return []
      }
      const rows = []
      if (data.director) {
        rows.push({ term: 'Director:', detail: data.director })
      }
      if (data.releaseDate) {
        rows.push({
          term: 'Release Year:',
          detail: String(data.releaseDate.getFullYear()),
        })
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
