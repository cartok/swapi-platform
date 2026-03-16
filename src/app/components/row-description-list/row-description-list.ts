import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
  selector: 'app-row-description-list',
  imports: [],
  templateUrl: './row-description-list.html',
  styleUrl: './row-description-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RowDescriptionList {
  readonly items = input.required<
    {
      term: string
      detail: string
    }[]
  >()
}
