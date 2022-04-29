import { TestBed } from '@angular/core/testing';

import { AccountSortService } from './account-sort.service';

describe('AccountSortService', () => {
    let service: AccountSortService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AccountSortService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
