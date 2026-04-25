import { NgOptimizedImage } from '@angular/common'
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core'

@Component({
  selector: 'app-image',
  imports: [NgOptimizedImage],
  templateUrl: './image.html',
  styleUrl: './image.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.app-image-fill]': 'fill()',
  },
})
export class Image {
  readonly ngSrc = input.required<NgOptimizedImage['ngSrc']>()
  readonly alt = input.required<HTMLImageElement['alt']>()
  readonly priority = input<NgOptimizedImage['priority'], unknown>(false, {
    transform: booleanAttribute,
  })
  readonly fill = input<NgOptimizedImage['fill'], unknown>(false, {
    transform: booleanAttribute,
  })
  readonly width = input<NgOptimizedImage['width']>(undefined)
  readonly height = input<NgOptimizedImage['height']>(undefined)
  readonly draggable = input<HTMLImageElement['draggable'], unknown>(false, {
    transform: booleanAttribute,
  })

  readonly loaded = signal(false)
  readonly loadError = signal(false)

  onImageLoad(): void {
    this.loaded.set(true)
  }

  onImageError(): void {
    this.loaded.set(false)
    this.loadError.set(true)
  }
}
