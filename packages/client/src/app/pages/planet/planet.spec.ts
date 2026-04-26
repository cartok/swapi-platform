import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router'
import { of } from 'rxjs'

import { FilmsService } from '@/api/swapi/resources/films/films.service'
import { PeopleService } from '@/api/swapi/resources/people/people.service'
import { PlanetsService } from '@/api/swapi/resources/planets/planets.service'
import { Planet } from '@/pages/planet/planet'

describe('Planet', () => {
  let component: Planet
  let fixture: ComponentFixture<Planet>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planet],
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

    fixture = TestBed.createComponent(Planet)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
