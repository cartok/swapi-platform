import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
  selector: 'app-labeled-box',
  imports: [NgTemplateOutlet],
  templateUrl: './labeled-box.html',
  styleUrl: './labeled-box.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabeledBox {
  readonly containerTag =
    input<Extract<keyof HTMLElementTagNameMap, 'div' | 'section' | 'nav'>>('div')
  readonly heading = input.required<string>()
  readonly headingId = input<string>()
}
