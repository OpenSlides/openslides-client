import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectorClockComponent } from './projector-clock.component';

xdescribe(`ProjectorClockComponent`, () => {
    let component: ProjectorClockComponent;
    let fixture: ComponentFixture<ProjectorClockComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectorClockComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorClockComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
