import { TestBed } from '@angular/core/testing';

import { MotionListSortService } from './motion-list-sort.service';

xdescribe(`MotionListSortService`, () => {
    let service: MotionListSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionListSortService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
