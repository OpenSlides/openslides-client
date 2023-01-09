import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectableTitleComponent } from './projectable-title.component';

xdescribe('ProjectableTitleComponent', () => {
  let component: ProjectableTitleComponent;
  let fixture: ComponentFixture<ProjectableTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectableTitleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectableTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
