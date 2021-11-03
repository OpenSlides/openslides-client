import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../../e2e-imports.module';
import { MotionChangeRecommendationRepositoryService } from './motion-change-recommendation-repository.service';

describe(`MotionChangeRecommendationRepositoryService`, () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [MotionChangeRecommendationRepositoryService]
        });
    });

    it(`should be created`, inject(
        [MotionChangeRecommendationRepositoryService],
        (service: MotionChangeRecommendationRepositoryService) => {
            expect(service).toBeTruthy();
        }
    ));
});
