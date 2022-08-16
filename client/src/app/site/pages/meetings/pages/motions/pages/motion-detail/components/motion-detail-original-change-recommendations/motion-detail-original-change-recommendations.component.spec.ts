import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionDetailOriginalChangeRecommendationsComponent } from './motion-detail-original-change-recommendations.component';

xdescribe(`MotionDetailOriginalChangeRecommendationsComponent`, () => {
    let component: MotionDetailOriginalChangeRecommendationsComponent;
    let fixture: ComponentFixture<MotionDetailOriginalChangeRecommendationsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionDetailOriginalChangeRecommendationsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionDetailOriginalChangeRecommendationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
