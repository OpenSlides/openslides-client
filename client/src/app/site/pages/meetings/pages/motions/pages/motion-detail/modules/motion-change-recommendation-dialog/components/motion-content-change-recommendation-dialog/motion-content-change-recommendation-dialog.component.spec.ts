import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MotionContentChangeRecommendationDialogComponent } from './motion-content-change-recommendation-dialog.component';

xdescribe(`MotionContentChangeRecommendationDialogComponent`, () => {
    let component: MotionContentChangeRecommendationDialogComponent;
    let fixture: ComponentFixture<MotionContentChangeRecommendationDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MotionContentChangeRecommendationDialogComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MotionContentChangeRecommendationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it(`should create`, () => {
        expect(component).toBeTruthy();
    });
});
