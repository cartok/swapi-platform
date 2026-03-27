import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { ImageGridItem } from '@/components/image-grid/image-grid-item/image-grid-item'

describe('ImageGridItem', () => {
  let component: ImageGridItem
  let fixture: ComponentFixture<ImageGridItem>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageGridItem],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(ImageGridItem)
    fixture.componentRef.setInput('imageUrl', '/assets/test-image.png')
    fixture.componentRef.setInput('imageAlt', 'Test image')
    fixture.componentRef.setInput('label', 'Test label')
    fixture.componentRef.setInput('linkUri', ['/test'])
    fixture.detectChanges()
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
