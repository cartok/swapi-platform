import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-default-page-layout',
  imports: [],
  template: '<ng-content />',
  host: {
    class: 'g-layout-container g-page-content',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultPageLayout {}
