import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionBlockCreateDialogComponent } from './motion-block-create-dialog.component';

xdescribe(`MotionBlockCreateDialogComponent`, () => {
    let component: MotionBlockCreateDialogComponent;
    let fixture: ComponentFixture<MotionBlockCreateDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionBlockCreateDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionBlockCreateDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
