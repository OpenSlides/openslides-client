import { TestBed } from '@angular/core/testing';

import { AmendmentListSortService } from './amendment-list-sort.service';

xdescribe(`AmendmentListSortService`, () => {
    let service: AmendmentListSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AmendmentListSortService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
