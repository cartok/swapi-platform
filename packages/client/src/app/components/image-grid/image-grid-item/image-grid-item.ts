import { NgOptimizedImage } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'

import { DeviceService } from '@/services/DeviceService'

@Component({
  selector: 'app-image-grid-item',
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './image-grid-item.html',
  styleUrl: './image-grid-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGridItem {
  readonly imageUrl = input.required<string>()
  readonly imageAlt = input.required<string>()
  readonly label = input.required<string>()
  readonly linkUri = input.required<RouterLink['routerLink']>()
  /**
   * Index starts at 1.
   */
  readonly index = input.required<number>()
  readonly device = inject(DeviceService)
}
