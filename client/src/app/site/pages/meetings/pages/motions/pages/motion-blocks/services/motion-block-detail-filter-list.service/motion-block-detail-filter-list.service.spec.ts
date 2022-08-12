import { TestBed } from '@angular/core/testing';

import { MotionBlockDetailFilterListService } from './motion-block-detail-filter-list.service';

xdescribe(`MotionBlockDetailFilterListService`, () => {
    let service: MotionBlockDetailFilterListService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionBlockDetailFilterListService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
