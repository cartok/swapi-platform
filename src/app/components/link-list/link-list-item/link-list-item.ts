import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'

@Component({
  selector: 'app-link-list-item',
  imports: [RouterLink],
  templateUrl: './link-list-item.html',
  styleUrl: './link-list-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkListItem {
  readonly linkUri = input.required<RouterLink['routerLink']>()
}
