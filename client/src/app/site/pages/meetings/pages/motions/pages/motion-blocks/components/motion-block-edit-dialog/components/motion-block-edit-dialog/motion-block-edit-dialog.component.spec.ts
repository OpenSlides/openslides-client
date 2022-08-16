import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionBlockEditDialogComponent } from './motion-block-edit-dialog.component';

xdescribe(`MotionBlockEditDialogComponent`, () => {
    let component: MotionBlockEditDialogComponent;
    let fixture: ComponentFixture<MotionBlockEditDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionBlockEditDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionBlockEditDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
