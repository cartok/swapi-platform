import { ChangeDetectionStrategy, Component, inject } from '@angular/core'

import { DeviceService } from '@/app/services/DeviceService'

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly device = inject(DeviceService)
}
