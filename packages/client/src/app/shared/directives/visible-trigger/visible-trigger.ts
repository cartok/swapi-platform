import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  type OnInit,
  output,
} from '@angular/core'

import { injectIsBrowser } from '@/app/shared/utils/platform'

@Directive({
  selector: '[appVisibleTrigger]',
})
export class VisibleTriggerDirective implements OnInit {
  readonly becameVisible = output<void>()

  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef)
  private readonly destroyRef = inject(DestroyRef)
  private readonly isBrowser = injectIsBrowser()
  private observer?: IntersectionObserver

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.disconnectObserver()
    })
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      this.becameVisible.emit()
      return
    }

    this.observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return
      }

      this.becameVisible.emit()
      this.disconnectObserver()
    })

    this.observer.observe(this.hostRef.nativeElement)
  }

  private disconnectObserver(): void {
    this.observer?.disconnect()
    this.observer = undefined
  }
}
