import { ChangeDetectionStrategy, Component } from '@angular/core'

import { Spritesheet } from '@/components/spritesheet/spritesheet'

@Component({
  selector: 'app-home',
  imports: [Spritesheet],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {}
