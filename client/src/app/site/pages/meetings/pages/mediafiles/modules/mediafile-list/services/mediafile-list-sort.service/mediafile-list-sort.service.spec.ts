import { TestBed } from '@angular/core/testing';

import { MediafileListSortService } from './mediafile-list-sort.service';

describe(`MediafileListSortService`, () => {
    let service: MediafileListSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MediafileListSortService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
