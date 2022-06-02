import { TestBed } from '@angular/core/testing';

import { ListSearchService } from './list-search.service';

describe(`ListSearchService`, () => {
    let service: ListSearchService<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ListSearchService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
