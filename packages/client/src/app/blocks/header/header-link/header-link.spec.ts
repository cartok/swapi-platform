import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { HeaderLink } from '@/blocks/header/header-link/header-link'

describe('HeaderLink', () => {
  let component: HeaderLink
  let fixture: ComponentFixture<HeaderLink>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderLink],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(HeaderLink)
    component = fixture.componentInstance
    fixture.componentRef.setInput('label', 'Home')
    fixture.componentRef.setInput('routerLink', '/')
    fixture.detectChanges()
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
