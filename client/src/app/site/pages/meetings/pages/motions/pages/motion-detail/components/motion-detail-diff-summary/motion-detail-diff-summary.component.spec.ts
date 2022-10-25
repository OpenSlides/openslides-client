import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionDetailDiffSummaryComponent } from './motion-detail-diff-summary.component';

xdescribe(`MotionDetailDiffSummaryComponent`, () => {
    let component: MotionDetailDiffSummaryComponent;
    let fixture: ComponentFixture<MotionDetailDiffSummaryComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionDetailDiffSummaryComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionDetailDiffSummaryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
