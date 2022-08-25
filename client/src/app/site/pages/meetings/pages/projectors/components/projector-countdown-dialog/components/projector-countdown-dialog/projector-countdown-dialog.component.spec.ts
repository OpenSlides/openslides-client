import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectorCountdownDialogComponent } from './projector-countdown-dialog.component';

xdescribe(`ProjectorCountdownDialogComponent`, () => {
    let component: ProjectorCountdownDialogComponent;
    let fixture: ComponentFixture<ProjectorCountdownDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectorCountdownDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorCountdownDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
