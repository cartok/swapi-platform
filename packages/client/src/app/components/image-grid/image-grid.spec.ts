import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { ImageGrid } from '@/components/image-grid/image-grid'

describe('ImageGrid', () => {
  let component: ImageGrid
  let fixture: ComponentFixture<ImageGrid>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageGrid],
    }).compileComponents()

    fixture = TestBed.createComponent(ImageGrid)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
