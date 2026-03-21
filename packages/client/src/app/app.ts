import { ChangeDetectionStrategy, Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'

import { Footer } from '@/app/blocks/footer/footer'
import { Header } from '@/app/blocks/header/header'
import { Separator } from '@/app/components/separator/separator'

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, Separator],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  title = 'Angular Signals-based SWAPI Frontend'
}
