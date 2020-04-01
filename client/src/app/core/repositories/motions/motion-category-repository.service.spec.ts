import { inject, TestBed } from '@angular/core/testing';

import { E2EImportsModule } from '../../../../e2e-imports.module';
import { MotionCategoryRepositoryService } from './motion-category-repository.service';

describe('MotionCategoryRepositoryService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [E2EImportsModule],
            providers: [MotionCategoryRepositoryService]
        });
    });

    it('should be created', inject([MotionCategoryRepositoryService], (service: MotionCategoryRepositoryService) => {
        expect(service).toBeTruthy();
    }));
});
