import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'

import { Image } from '@/components/image/image'
import { DeviceService } from '@/services/DeviceService'

@Component({
  selector: 'app-image-grid-item',
  imports: [Image, RouterLink],
  templateUrl: './image-grid-item.html',
  styleUrl: './image-grid-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGridItem {
  readonly imageUrl = input.required<string>()
  readonly imageAlt = input.required<string>()
  readonly label = input.required<string>()
  readonly linkUri = input.required<RouterLink['routerLink']>()
  readonly index = input.required<number>()

  readonly device = inject(DeviceService)
}
