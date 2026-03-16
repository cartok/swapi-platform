import { ChangeDetectionStrategy, Component } from '@angular/core'

@Component({
  selector: 'app-image-grid',
  imports: [],
  templateUrl: './image-grid.html',
  styleUrl: './image-grid.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGrid {}
