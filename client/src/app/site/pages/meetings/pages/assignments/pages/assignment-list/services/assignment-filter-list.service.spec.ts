import { TestBed } from '@angular/core/testing';

import { AssignmentFilterListService } from './assignment-filter-list.service';

xdescribe(`AssignmentFilterListService`, () => {
    let service: AssignmentFilterListService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentFilterListService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
