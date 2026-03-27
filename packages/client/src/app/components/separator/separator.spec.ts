import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { Separator } from '@/components/separator/separator'

describe('Separator', () => {
  let component: Separator
  let fixture: ComponentFixture<Separator>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Separator],
    }).compileComponents()

    fixture = TestBed.createComponent(Separator)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
