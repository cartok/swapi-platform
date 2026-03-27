import { DOCUMENT } from '@angular/common'
import { DestroyRef, Directive, ElementRef, inject, input, output } from '@angular/core'

import { injectIsBrowser } from '@/shared/utils/platform'

type SwipeDirection = 'left' | 'right'
type SwipeCancelReason =
  | 'distance-too-short'
  | 'window-blur'
  | 'pointer-cancel'
  | 'lost-pointer-capture'
  | 'left-browser-window'

interface SwipeEvent {
  direction: SwipeDirection
  deltaX: number
  deltaY: number
}

interface SwipeStateEvent {
  startX: number
  startY: number
  currentX: number
  currentY: number
  deltaX: number
  deltaY: number
}

interface SwipeTracking {
  pointerId: number
  startX: number
  startY: number
  currentX: number
  currentY: number
}

@Directive({
  selector: '[appSwipe]',
  host: {
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp($event)',
    '(pointercancel)': 'onPointerCancel()',
    '(lostpointercapture)': 'onLostPointerCapture()',
    '[style.touch-action]': '"pan-y"',
  },
})
export class SwipeDirective {
  readonly minDistance = input(90)

  readonly swipeStart = output<SwipeStateEvent>()
  readonly swipeEnd = output<SwipeStateEvent>()
  readonly swipe = output<SwipeEvent>()
  readonly swipeLeft = output<SwipeEvent>()
  readonly swipeRight = output<SwipeEvent>()
  readonly swipeCancel = output<SwipeCancelReason>()

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef)
  private readonly destroyRef = inject(DestroyRef)
  private readonly document = inject(DOCUMENT)
  private readonly isBrowser = injectIsBrowser()
  private tracking: SwipeTracking | null = null

  constructor() {
    this.destroyRef.onDestroy(() => {
      if (!this.isBrowser) {
        return
      }

      this.unbindGlobalListeners()
      this.releasePointerCapture(this.tracking?.pointerId)
    })
  }

  onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }
    if (this.tracking) {
      return
    }

    const host = this.hostRef.nativeElement
    this.tracking = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
    }

    this.swipeStart.emit(this.toSwipeStateEvent(this.tracking))
    host.setPointerCapture(event.pointerId)
    this.bindGlobalListeners()
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.tracking || event.pointerId !== this.tracking.pointerId) {
      return
    }

    this.tracking.currentX = event.clientX
    this.tracking.currentY = event.clientY
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.tracking || event.pointerId !== this.tracking.pointerId) {
      return
    }

    this.finishTracking(event.clientX, event.clientY)
  }

  onPointerCancel(): void {
    this.cancel('pointer-cancel')
  }

  onLostPointerCapture(): void {
    this.cancel('lost-pointer-capture')
  }

  private finishTracking(endX: number, endY: number): void {
    const currentTracking = this.tracking
    if (!currentTracking) {
      return
    }

    const deltaX = endX - currentTracking.startX
    const deltaY = endY - currentTracking.startY
    const endEvent: SwipeStateEvent = {
      startX: currentTracking.startX,
      startY: currentTracking.startY,
      currentX: endX,
      currentY: endY,
      deltaX,
      deltaY,
    }

    this.resetTracking()
    this.swipeEnd.emit(endEvent)

    if (Math.abs(deltaX) < this.minDistance()) {
      this.swipeCancel.emit('distance-too-short')
      return
    }

    const swipeEvent: SwipeEvent = {
      direction: deltaX < 0 ? 'left' : 'right',
      deltaX,
      deltaY,
    }

    this.swipe.emit(swipeEvent)

    if (swipeEvent.direction === 'left') {
      this.swipeLeft.emit(swipeEvent)
      return
    }

    this.swipeRight.emit(swipeEvent)
  }

  private cancel(reason: SwipeCancelReason): void {
    if (!this.tracking) {
      return
    }

    this.resetTracking()
    this.swipeCancel.emit(reason)
  }

  private resetTracking(): void {
    const pointerId = this.tracking?.pointerId
    this.tracking = null
    this.unbindGlobalListeners()
    this.releasePointerCapture(pointerId)
  }

  private readonly onWindowBlur = (): void => {
    this.cancel('window-blur')
  }

  private readonly onDocumentMouseLeave = (event: MouseEvent): void => {
    if (!this.tracking || event.relatedTarget !== null) {
      return
    }

    this.cancel('left-browser-window')
  }

  private bindGlobalListeners(): void {
    window.addEventListener('blur', this.onWindowBlur)
    this.document.addEventListener('mouseleave', this.onDocumentMouseLeave)
  }

  private unbindGlobalListeners(): void {
    window.removeEventListener('blur', this.onWindowBlur)
    this.document.removeEventListener('mouseleave', this.onDocumentMouseLeave)
  }

  private releasePointerCapture(pointerId: number | undefined): void {
    if (pointerId === undefined) {
      return
    }

    const host = this.hostRef.nativeElement
    if (!host.hasPointerCapture(pointerId)) {
      return
    }

    host.releasePointerCapture(pointerId)
  }

  private toSwipeStateEvent(tracking: SwipeTracking): SwipeStateEvent {
    return {
      startX: tracking.startX,
      startY: tracking.startY,
      currentX: tracking.currentX,
      currentY: tracking.currentY,
      deltaX: tracking.currentX - tracking.startX,
      deltaY: tracking.currentY - tracking.startY,
    }
  }
}
