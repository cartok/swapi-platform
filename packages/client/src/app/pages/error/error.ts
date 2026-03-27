import { ChangeDetectionStrategy, Component } from '@angular/core'

import { DefaultPageLayout } from '@/layouts/default-page-layout/default-page-layout'

@Component({
  selector: 'app-error',
  imports: [DefaultPageLayout],
  templateUrl: './error.html',
  styleUrl: './error.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorPage {}
