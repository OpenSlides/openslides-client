import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionExportComponent } from './motion-export.component';

describe.skip(`MotionExportComponent`, () => {
    let component: MotionExportComponent;
    let fixture: ComponentFixture<MotionExportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionExportComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionExportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
