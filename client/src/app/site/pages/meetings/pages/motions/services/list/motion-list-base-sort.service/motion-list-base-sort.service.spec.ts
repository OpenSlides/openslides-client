import { TestBed } from '@angular/core/testing';

import { MotionListBaseSortService } from './motion-list-base-sort.service';

xdescribe(`MotionListBaseSortService`, () => {
    let service: MotionListBaseSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionListBaseSortService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
