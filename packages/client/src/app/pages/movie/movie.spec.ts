import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { of } from 'rxjs'

import { FilmsService } from '@/api/swapi/resources/films/films.service'
import { PeopleService } from '@/api/swapi/resources/people/people.service'
import { PlanetsService } from '@/api/swapi/resources/planets/planets.service'
import { Movie } from '@/pages/movie/movie'

describe('Movie', () => {
  let component: Movie
  let fixture: ComponentFixture<Movie>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Movie],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        FilmsService,
        PeopleService,
        PlanetsService,
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
            },
          },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(Movie)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
