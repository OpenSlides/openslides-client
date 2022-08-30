import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionListInfoDialogComponent } from './motion-list-info-dialog.component';

xdescribe(`MotionListInfoDialogComponent`, () => {
    let component: MotionListInfoDialogComponent;
    let fixture: ComponentFixture<MotionListInfoDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionListInfoDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionListInfoDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
