import { TestBed } from '@angular/core/testing';

import { AccountFilterService } from './account-filter.service';

describe(`AccountFilterService`, () => {
    let service: AccountFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AccountFilterService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
