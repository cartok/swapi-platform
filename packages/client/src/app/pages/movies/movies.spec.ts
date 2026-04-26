import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { FilmsService } from '@/api/swapi/resources/films/films.service'
import { Movies } from '@/pages/movies/movies'

describe('Movies', () => {
  let component: Movies
  let fixture: ComponentFixture<Movies>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Movies],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        FilmsService,
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(Movies)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
