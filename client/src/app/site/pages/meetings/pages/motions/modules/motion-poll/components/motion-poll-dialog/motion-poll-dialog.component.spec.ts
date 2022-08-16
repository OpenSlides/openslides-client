import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionPollDialogComponent } from './motion-poll-dialog.component';

xdescribe(`MotionPollDialogComponent`, () => {
    let component: MotionPollDialogComponent;
    let fixture: ComponentFixture<MotionPollDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionPollDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionPollDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
