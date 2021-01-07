import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchRepoSelectorComponent } from './search-repo-selector.component';

describe('SearchRepoSelectorComponent', () => {
  let component: SearchRepoSelectorComponent;
  let fixture: ComponentFixture<SearchRepoSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchRepoSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchRepoSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
