import type { OnInit } from '@angular/core'
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
export class ImageGridItem implements OnInit {
  readonly imageUrl = input.required<string>()
  readonly imageAlt = input.required<string>()
  readonly label = input.required<string>()
  readonly linkUri = input.required<RouterLink['routerLink']>()
  readonly index = input.required<number>()

  readonly device = inject(DeviceService)

  isInInitialViewPort!: boolean

  ngOnInit() {
    const isInInitialViewPort = this.getIsInInitialViewport(this.index())
    this.isInInitialViewPort = isInInitialViewPort
  }

  private getIsInInitialViewport(imageIndex: number): boolean {
    // Constrained width and eventually height
    if (this.device.isMaxWidth(this.device.WIDTH.W601)) {
      if (this.device.isMaxHeight(this.device.HEIGHT.H1280)) {
        return imageIndex < 2
      } else {
        return imageIndex < 1
      }
    }
    if (this.device.isMaxWidth(this.device.WIDTH.W768)) {
      return imageIndex < 1
    }
    if (this.device.isMaxWidth(this.device.WIDTH.W1100)) {
      if (this.device.isMaxHeight(this.device.HEIGHT.H915)) {
        return imageIndex < 2
      }
      return imageIndex < 4
    }
    if (this.device.isMaxWidth(this.device.WIDTH.W1280)) {
      if (this.device.isMaxHeight(this.device.HEIGHT.H820)) {
        return imageIndex < 3
      }
      return imageIndex < 6
    }
    // Constrained height
    if (this.device.isMaxHeight(this.device.HEIGHT.H1080)) {
      return imageIndex < 3
    }
    return imageIndex < 6
  }
}
