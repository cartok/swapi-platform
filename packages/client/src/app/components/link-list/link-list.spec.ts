import type { ComponentFixture } from '@angular/core/testing'
import { TestBed } from '@angular/core/testing'

import { LinkList } from '@/app/components/link-list/link-list'

describe('LinkList', () => {
  let component: LinkList
  let fixture: ComponentFixture<LinkList>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinkList],
    }).compileComponents()

    fixture = TestBed.createComponent(LinkList)
    component = fixture.componentInstance
    await fixture.whenStable()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
