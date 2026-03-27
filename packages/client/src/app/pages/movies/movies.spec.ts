import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { Movies } from '@/pages/movies/movies'

describe('Movies', () => {
  let component: Movies
  let fixture: ComponentFixture<Movies>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Movies],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(Movies)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
