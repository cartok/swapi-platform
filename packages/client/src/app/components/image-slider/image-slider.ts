import { NgOptimizedImage } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core'

import { SwipeDirective } from '@/shared/directives/swipe/swipe'

@Component({
  selector: 'app-image-slider',
  imports: [SwipeDirective, NgOptimizedImage],
  templateUrl: './image-slider.html',
  styleUrl: './image-slider.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageSlider {
  readonly images =
    input.required<{ url: string; alt: string; width: number; height: number }[]>()
  readonly viewportHeight = input.required<number>()
  readonly isSwiping = signal(false)
  private readonly _activeIndex = signal(0)
  readonly activeIndex = this._activeIndex.asReadonly()
  readonly slidesTranslateX = computed<string>(() => `-${this.activeIndex() * 100}%`)

  setActiveIndex(index: number): void {
    const imageCount = this.images().length
    if (imageCount === 0) {
      this._activeIndex.set(0)
      return
    }

    const wrappedIndex = ((index % imageCount) + imageCount) % imageCount
    this._activeIndex.set(wrappedIndex)
  }

  decrementActiveIndex(): void {
    this.setActiveIndex(this._activeIndex() - 1)
  }

  incrementActiveIndex(): void {
    this.setActiveIndex(this._activeIndex() + 1)
  }

  enableDraggingCursor(): void {
    this.isSwiping.set(true)
  }

  disableDraggingCursor(): void {
    this.isSwiping.set(false)
  }
}
