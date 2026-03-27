import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core'

import type { Person } from '@/api/swapi/resources/people/people.model'
import { PeopleService } from '@/api/swapi/resources/people/people.service'
import { Heading } from '@/components/heading/heading'
import { ImageGrid } from '@/components/image-grid/image-grid'
import { ImageGridItem } from '@/components/image-grid/image-grid-item/image-grid-item'
import { DefaultPageLayout } from '@/layouts/default-page-layout/default-page-layout'

@Component({
  selector: 'app-characters',
  imports: [Heading, ImageGrid, ImageGridItem, DefaultPageLayout],
  templateUrl: './characters.html',
  styleUrl: './characters.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Characters {
  readonly peopleService = inject(PeopleService)
  readonly page = signal('1')
  readonly collection = this.peopleService.getCollection(this.page)

  imageTitle = (person: Person) => `Image of "${person.name}"`
  linkUri = (person: Person) => `/character/${person.id}`
}
