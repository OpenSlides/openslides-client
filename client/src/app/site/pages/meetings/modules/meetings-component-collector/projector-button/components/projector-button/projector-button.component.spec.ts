import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectorButtonComponent } from './projector-button.component';

xdescribe(`ProjectorButtonComponent`, () => {
    let component: ProjectorButtonComponent;
    let fixture: ComponentFixture<ProjectorButtonComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectorButtonComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorButtonComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
