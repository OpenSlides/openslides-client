import { TestBed } from '@angular/core/testing';

import { AccountControllerService } from './account-controller.service';

xdescribe(`AccountControllerService`, () => {
    let service: AccountControllerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AccountControllerService);
    });

    it(`should be created`, () => {
        expect(service).toBeTruthy();
    });
});
