import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-detail-page-layout',
  imports: [],
  templateUrl: './detail-page-layout.html',
  styleUrl: './detail-page-layout.css',
  host: {
    class: 'g-layout-container g-page-content',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailPageLayout {}
