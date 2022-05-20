import { TestBed } from '@angular/core/testing';

import { MotionChangeRecommendationDialogService } from './motion-change-recommendation-dialog.service';

describe(`MotionChangeRecommendationDialogService`, () => {
    let service: MotionChangeRecommendationDialogService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionChangeRecommendationDialogService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
