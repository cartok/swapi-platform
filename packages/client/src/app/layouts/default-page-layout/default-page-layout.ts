import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-default-page-layout',
  imports: [],
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'g-layout-container g-page-content',
  },
})
export class DefaultPageLayout {}
