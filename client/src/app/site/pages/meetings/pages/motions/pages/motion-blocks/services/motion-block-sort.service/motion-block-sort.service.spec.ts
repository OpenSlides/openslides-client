import { TestBed } from '@angular/core/testing';

import { MotionBlockSortService } from './motion-block-sort.service';

xdescribe(`MotionBlockSortService`, () => {
    let service: MotionBlockSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionBlockSortService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
