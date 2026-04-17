import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink, RouterLinkActive } from '@angular/router'

interface HeaderNavLink {
  readonly exact: boolean
  readonly label: string
  readonly to: string
}

const HEADER_NAV_LINKS: HeaderNavLink[] = [
  { exact: true, label: 'Movies', to: '/movies' },
  { exact: true, label: 'Characters', to: '/characters' },
  { exact: true, label: 'Planets', to: '/planets' },
]

@Component({
  selector: 'app-header-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header-nav.html',
  styleUrl: './header-nav.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderNav {
  readonly links = HEADER_NAV_LINKS
}
