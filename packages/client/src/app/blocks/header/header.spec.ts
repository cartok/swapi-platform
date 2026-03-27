import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { Header } from '@/blocks/header/header'

describe('Header', () => {
  let component: Header
  let fixture: ComponentFixture<Header>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(Header)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
