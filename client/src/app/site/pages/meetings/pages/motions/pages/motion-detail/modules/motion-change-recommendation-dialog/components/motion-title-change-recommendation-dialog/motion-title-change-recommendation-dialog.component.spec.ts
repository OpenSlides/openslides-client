import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionTitleChangeRecommendationDialogComponent } from './motion-title-change-recommendation-dialog.component';

xdescribe(`MotionTitleChangeRecommendationDialogComponent`, () => {
    let component: MotionTitleChangeRecommendationDialogComponent;
    let fixture: ComponentFixture<MotionTitleChangeRecommendationDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionTitleChangeRecommendationDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionTitleChangeRecommendationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
