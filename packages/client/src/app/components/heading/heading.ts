import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
  selector: 'app-heading',
  imports: [],
  templateUrl: './heading.html',
  styleUrl: './heading.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Heading {
  readonly location = input<string>()
  readonly title = input.required<string>()
  readonly titleId = input<string>()
  readonly subtitle = input<string>()
}
