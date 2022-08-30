import { TestBed } from '@angular/core/testing';

import { AssignmentSortListService } from './assignment-sort-list.service';

xdescribe(`AssignmentSortListService`, () => {
    let service: AssignmentSortListService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AssignmentSortListService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
