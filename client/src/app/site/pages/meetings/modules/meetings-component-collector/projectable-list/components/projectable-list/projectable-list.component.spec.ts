import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectableListComponent } from './projectable-list.component';

xdescribe(`ProjectableListComponent`, () => {
    // let component: ProjectableListComponent;
    // let fixture: ComponentFixture<ProjectableListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectableListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        // fixture = TestBed.createComponent(ProjectableListComponent);
        // component = fixture.componentInstance;
        // fixture.detectChanges();
    });

    it(`should create`, () => {
        // expect(component).toBeTruthy();
    });
});
