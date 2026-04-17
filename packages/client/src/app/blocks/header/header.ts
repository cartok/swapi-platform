import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink } from '@angular/router'

import { HeaderNav } from '@/blocks/header/header-nav/header-nav'

@Component({
  selector: 'app-header',
  imports: [RouterLink, HeaderNav],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {}
