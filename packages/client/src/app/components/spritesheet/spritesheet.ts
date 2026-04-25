import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'

import spriteSheetUrl from '@/assets/svg/sprite-sheet.svg?no-inline'

type SpriteId = 'star-wars-logo' | 'circle' | 'image-placeholder'

@Component({
  selector: 'app-spritesheet',
  imports: [],
  templateUrl: './spritesheet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Spritesheet {
  readonly symbol = input.required<SpriteId>()
  readonly width = input.required<number>()
  readonly height = input.required<number>()
  readonly href = computed<string>(() => `${spriteSheetUrl}#${this.symbol()}`)
}
