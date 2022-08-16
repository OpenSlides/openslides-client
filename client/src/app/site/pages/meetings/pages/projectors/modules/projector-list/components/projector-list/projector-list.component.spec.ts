import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectorListComponent } from './projector-list.component';

xdescribe(`ProjectorListComponent`, () => {
    let component: ProjectorListComponent;
    let fixture: ComponentFixture<ProjectorListComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectorListComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
