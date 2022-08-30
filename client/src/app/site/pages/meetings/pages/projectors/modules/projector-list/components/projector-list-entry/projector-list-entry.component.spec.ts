import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectorListEntryComponent } from './projector-list-entry.component';

xdescribe(`ProjectorListEntryComponent`, () => {
    let component: ProjectorListEntryComponent;
    let fixture: ComponentFixture<ProjectorListEntryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectorListEntryComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorListEntryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
