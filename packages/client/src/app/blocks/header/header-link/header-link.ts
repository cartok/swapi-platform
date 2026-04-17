import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'

@Component({
  selector: 'app-header-link',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-link.html',
  styleUrl: './header-link.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderLink {
  readonly label = input.required<string>()
  readonly to = input.required<RouterLink['to']>()
  readonly exact = input(false)
}
