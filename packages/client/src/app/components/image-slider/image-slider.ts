import { Tab, TabList, TabPanel, Tabs } from '@angular/aria/tabs'
import type { ElementRef, OnInit } from '@angular/core'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
  viewChild,
} from '@angular/core'

import { Image } from '@/components/image/image'
import { SwipeDirective } from '@/shared/directives/swipe/swipe'

@Component({
  selector: 'app-image-slider',
  imports: [SwipeDirective, Image, Tabs, TabList, Tab, TabPanel],
  templateUrl: './image-slider.html',
  styleUrl: './image-slider.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageSlider implements OnInit {
  readonly images =
    input.required<{ url: string; alt: string; width: number; height: number }[]>()
  readonly viewportHeight = input.required<number>()
  readonly isSwiping = signal(false)
  private readonly indicatorsRef = viewChild<ElementRef<HTMLElement>>('indicators')

  private readonly _activeIndex = signal(0)
  readonly activeIndex = this._activeIndex.asReadonly()
  readonly selectedTab = computed<string | undefined>(() => {
    if (this.images().length === 0) {
      return undefined
    }
    return this.toTabValue(this.activeIndex())
  })
  readonly activeImageAnnouncement = computed<string>(() => {
    const images = this.images()
    if (images.length === 0) {
      return 'No image selected'
    }

    const index = this.activeIndex()
    const image = images[index]
    const imageName = image?.alt?.trim()
    const imageLabel = imageName ? `: ${imageName}` : ''
    return `Showing image ${index + 1} of ${images.length}${imageLabel}`
  })
  readonly slidesTranslateX = computed<string>(() => `-${this.activeIndex() * 100}%`)

  initialImageUrl!: string

  ngOnInit(): void {
    this.initialImageUrl = this.images()[this.activeIndex()]?.url
  }

  onSelectedTabChange(tabValue: string | undefined): void {
    const index = this.toTabIndex(tabValue)
    if (index === null) {
      return
    }

    this.setActiveIndex(index)
  }

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

  onSwipeLeft(): void {
    this.incrementActiveIndex()
    this.focusIndicators()
  }

  onSwipeRight(): void {
    this.decrementActiveIndex()
    this.focusIndicators()
  }

  enableDraggingCursor(): void {
    this.isSwiping.set(true)
  }

  disableDraggingCursor(): void {
    this.isSwiping.set(false)
  }

  indicatorAriaLabel(index: number): string {
    const images = this.images()
    const imageName = images[index]?.alt?.trim()
    if (!imageName) {
      return `Show image ${index + 1} of ${images.length}`
    }

    return `Show image ${index + 1} of ${images.length}: ${imageName}`
  }

  toTabValue(index: number): string {
    return `slide-${index}`
  }

  private focusIndicators(): void {
    requestAnimationFrame(() => {
      this.indicatorsRef()?.nativeElement.focus({ preventScroll: true })
    })
  }

  private toTabIndex(value: string | undefined): number | null {
    if (!value?.startsWith('slide-')) {
      return null
    }

    const indexString = value.slice('slide-'.length)
    const index = Number.parseInt(indexString, 10)
    if (!Number.isInteger(index) || index < 0) {
      return null
    }

    return index
  }
}
