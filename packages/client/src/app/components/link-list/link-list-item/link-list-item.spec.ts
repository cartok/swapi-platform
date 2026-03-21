import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'

import { LinkListItem } from '@/app/components/link-list/link-list-item/link-list-item'

describe('LinkListItem', () => {
  let component: LinkListItem
  let fixture: ComponentFixture<LinkListItem>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkListItem],
      providers: [provideRouter([])],
    }).compileComponents()

    fixture = TestBed.createComponent(LinkListItem)
    fixture.componentRef.setInput('linkUri', ['/test'])
    fixture.detectChanges()
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
