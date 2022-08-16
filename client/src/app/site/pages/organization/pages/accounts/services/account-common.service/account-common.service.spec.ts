import { TestBed } from '@angular/core/testing';

import { AccountCommonService } from './account-common.service';

xdescribe(`AccountCommonService`, () => {
    let service: AccountCommonService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AccountCommonService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
