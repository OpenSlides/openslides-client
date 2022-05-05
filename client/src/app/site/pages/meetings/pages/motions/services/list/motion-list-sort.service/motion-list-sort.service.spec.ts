import { TestBed } from '@angular/core/testing';

import { MotionListSortService } from './motion-list-sort.service';

describe('MotionListSortService', () => {
    let service: MotionListSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MotionListSortService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
