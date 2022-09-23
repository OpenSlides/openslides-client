import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentPollDialogComponent } from './assignment-poll-dialog.component';

xdescribe(`AssignmentPollDialogComponent`, () => {
    let component: AssignmentPollDialogComponent;
    let fixture: ComponentFixture<AssignmentPollDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AssignmentPollDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AssignmentPollDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
