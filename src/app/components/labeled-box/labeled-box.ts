import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-labeled-box',
  imports: [],
  templateUrl: './labeled-box.html',
  styleUrl: './labeled-box.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabeledBox {}
