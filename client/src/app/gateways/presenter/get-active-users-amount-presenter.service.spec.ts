import { TestBed } from '@angular/core/testing';

import { GetActiveUsersAmountPresenterService } from './get-active-users-amount-presenter.service';

describe('GetActiveUserAmountPresenterService', () => {
    let service: GetActiveUsersAmountPresenterService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GetActiveUsersAmountPresenterService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
