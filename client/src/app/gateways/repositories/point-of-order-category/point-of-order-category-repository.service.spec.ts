import { TestBed } from '@angular/core/testing';

import { PointOfOrderCategoryRepositoryService } from './point-of-order-category-repository.service';

xdescribe(`PointOfOrderCategoryRepositoryService`, () => {
    let service: PointOfOrderCategoryRepositoryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PointOfOrderCategoryRepositoryService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
