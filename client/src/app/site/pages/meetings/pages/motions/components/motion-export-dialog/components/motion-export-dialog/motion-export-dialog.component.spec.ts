import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionExportDialogComponent } from './motion-export-dialog.component';

xdescribe(`MotionExportDialogComponent`, () => {
    let component: MotionExportDialogComponent;
    let fixture: ComponentFixture<MotionExportDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionExportDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionExportDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
