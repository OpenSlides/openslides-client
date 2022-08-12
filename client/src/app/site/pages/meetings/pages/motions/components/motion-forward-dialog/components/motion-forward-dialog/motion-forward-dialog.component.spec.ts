import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionForwardDialogComponent } from './motion-forward-dialog.component';

xdescribe(`MotionForwardDialogComponent`, () => {
    let component: MotionForwardDialogComponent;
    let fixture: ComponentFixture<MotionForwardDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionForwardDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionForwardDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
