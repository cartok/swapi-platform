import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-link-list',
  imports: [],
  templateUrl: './link-list.html',
  styleUrl: './link-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkList {}
