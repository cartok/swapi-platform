import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { PlanetsService } from '@/api/swapi/resources/planets/planets.service'
import { Planets } from '@/pages/planets/planets'

describe('Planets', () => {
  let component: Planets
  let fixture: ComponentFixture<Planets>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Planets],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        PlanetsService,
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(Planets)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
