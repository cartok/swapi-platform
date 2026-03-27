import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { Heading } from '@/components/heading/heading'

describe('PageHeading', () => {
  let component: Heading
  let fixture: ComponentFixture<Heading>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Heading],
    }).compileComponents()

    fixture = TestBed.createComponent(Heading)
    fixture.componentRef.setInput('title', 'Test Title')
    fixture.detectChanges()
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
