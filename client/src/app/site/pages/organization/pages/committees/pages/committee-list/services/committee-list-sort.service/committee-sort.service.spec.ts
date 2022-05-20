import { TestBed } from '@angular/core/testing';

import { CommitteeSortService } from './committee-sort.service';

describe(`CommitteeSortService`, () => {
    let service: CommitteeSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CommitteeSortService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
