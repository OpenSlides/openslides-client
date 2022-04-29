import { TestBed } from '@angular/core/testing';

import { MotionCategoryControllerService } from './motion-category-controller.service';

describe('MotionCategoryControllerService', () => {
    let service: MotionCategoryControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionCategoryControllerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
