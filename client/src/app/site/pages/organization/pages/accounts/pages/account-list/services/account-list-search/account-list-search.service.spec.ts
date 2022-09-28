import { TestBed } from '@angular/core/testing';

import { AccountListSearchService } from './account-list-search.service';

xdescribe(`AccountListSearchService`, () => {
    let service: AccountListSearchService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AccountListSearchService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
