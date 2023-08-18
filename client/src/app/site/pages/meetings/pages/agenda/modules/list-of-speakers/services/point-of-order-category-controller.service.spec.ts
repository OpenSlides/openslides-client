import { TestBed } from '@angular/core/testing';

import { PointOfOrderCategoryControllerService } from './point-of-order-category-controller.service';

xdescribe(`PointOfOrderCategoryControllerService`, () => {
    let service: PointOfOrderCategoryControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PointOfOrderCategoryControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
