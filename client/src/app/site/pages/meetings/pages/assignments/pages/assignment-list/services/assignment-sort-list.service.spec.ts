import { TestBed } from '@angular/core/testing';

import { AssignmentSortListService } from './assignment-sort-list.service';

describe(`AssignmentSortListService`, () => {
    let service: AssignmentSortListService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentSortListService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
