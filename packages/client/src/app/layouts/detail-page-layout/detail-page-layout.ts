import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-detail-page-layout',
  imports: [],
  templateUrl: './detail-page-layout.html',
  styleUrl: './detail-page-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'g-layout-container g-page-content',
  },
})
export class DetailPageLayout {}
