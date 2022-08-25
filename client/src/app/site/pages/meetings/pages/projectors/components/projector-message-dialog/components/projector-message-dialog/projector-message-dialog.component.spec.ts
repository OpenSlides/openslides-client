import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectorMessageDialogComponent } from './projector-message-dialog.component';

xdescribe(`ProjectorMessageDialogComponent`, () => {
    let component: ProjectorMessageDialogComponent;
    let fixture: ComponentFixture<ProjectorMessageDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProjectorMessageDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProjectorMessageDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
