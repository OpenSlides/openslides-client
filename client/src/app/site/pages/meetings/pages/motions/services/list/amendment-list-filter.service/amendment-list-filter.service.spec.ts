import { TestBed } from '@angular/core/testing';

import { AmendmentListFilterService } from './amendment-list-filter.service';

xdescribe(`AmendmentListFilterService`, () => {
    let service: AmendmentListFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AmendmentListFilterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
