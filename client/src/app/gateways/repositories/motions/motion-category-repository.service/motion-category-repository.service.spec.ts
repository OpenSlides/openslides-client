import { TestBed } from '@angular/core/testing';

import { MotionCategoryRepositoryService } from './motion-category-repository.service';

describe('MotionCategoryRepositoryService', () => {
    let service: MotionCategoryRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionCategoryRepositoryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
