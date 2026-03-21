import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'

type HeaderRouterLink = RouterLink['routerLink']

@Component({
  selector: 'app-header-link',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-link.html',
  styleUrl: './header-link.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderLink {
  readonly label = input.required<string>()
  readonly routerLink = input.required<HeaderRouterLink>()
  readonly exact = input(false)
}
