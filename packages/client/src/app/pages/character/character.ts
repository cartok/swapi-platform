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
  selector: 'app-character',
  imports: [
    Heading,
    RowDescriptionList,
    ImageSlider,
    LinkList,
    LabeledBox,
    LinkListItem,
    DetailPageLayout,
  ],
  templateUrl: './character.html',
  styleUrl: './character.css',
  providers: [FilmsService, PeopleService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Character {
  private readonly router = inject(Router)
  private readonly route = inject(ActivatedRoute)
  private readonly filmsService = inject(FilmsService)
  private readonly peopleService = inject(PeopleService)

  readonly id = toSignal(this.route.paramMap.pipe(map((pm) => pm.get('id')!)), {
    initialValue: this.route.snapshot.paramMap.get('id')!,
  })
  readonly item = this.peopleService.getItem(this.id, {
    retryPolicy: CRITICAL_HTTP_RETRY_POLICY,
  })
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
      if (data.gender) {
        rows.push({ term: 'Gender:', detail: data.gender })
      }
      if (data.birthYear) {
        rows.push({ term: 'Birth Year:', detail: data.birthYear })
      }
      if (data.height) {
        rows.push({ term: 'Height:', detail: data.height })
      }
      if (data.mass) {
        rows.push({ term: 'Mass:', detail: data.mass })
      }
      if (data.eyeColor) {
        rows.push({ term: 'Eye Color:', detail: data.eyeColor })
      }
      if (data.hairColor) {
        rows.push({ term: 'Hair Color:', detail: data.hairColor })
      }
      if (data.skinColor) {
        rows.push({ term: 'Skin Color:', detail: data.skinColor })
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
