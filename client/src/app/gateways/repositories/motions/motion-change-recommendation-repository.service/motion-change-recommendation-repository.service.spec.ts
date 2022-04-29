import { TestBed } from '@angular/core/testing';

import { MotionChangeRecommendationRepositoryService } from './motion-change-recommendation-repository.service';

describe('MotionChangeRecommendationRepositoryService', () => {
    let service: MotionChangeRecommendationRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionChangeRecommendationRepositoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
