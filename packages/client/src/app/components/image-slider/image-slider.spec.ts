import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { ImageSlider } from '@/app/components/image-slider/image-slider'

describe('ImageSlider', () => {
  let component: ImageSlider
  let fixture: ComponentFixture<ImageSlider>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageSlider],
    }).compileComponents()

    fixture = TestBed.createComponent(ImageSlider)
    fixture.componentRef.setInput('images', [])
    fixture.componentRef.setInput('viewportHeight', 374)
    fixture.detectChanges()
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
