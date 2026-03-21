import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { LabeledBox } from '@/app/components/labeled-box/labeled-box'

describe('LabeledBox', () => {
  let component: LabeledBox
  let fixture: ComponentFixture<LabeledBox>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabeledBox],
    }).compileComponents()

    fixture = TestBed.createComponent(LabeledBox)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
