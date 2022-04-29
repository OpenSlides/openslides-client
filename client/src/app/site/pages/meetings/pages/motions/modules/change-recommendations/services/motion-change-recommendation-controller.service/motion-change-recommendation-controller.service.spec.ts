import { TestBed } from '@angular/core/testing';

import { MotionChangeRecommendationControllerService } from './motion-change-recommendation-controller.service';

describe('MotionChangeRecommendationControllerService', () => {
    let service: MotionChangeRecommendationControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionChangeRecommendationControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
