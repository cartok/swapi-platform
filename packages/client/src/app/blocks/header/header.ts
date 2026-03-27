import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterLink } from '@angular/router'

import { HeaderLink } from '@/blocks/header/header-link/header-link'

@Component({
  selector: 'app-header',
  imports: [RouterLink, HeaderLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {}
