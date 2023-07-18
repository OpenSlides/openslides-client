import { TestBed } from '@angular/core/testing';

import { GetActiveUsersAmountPresenterService } from './get-active-users-amount-presenter.service';
import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';
import { MockPresenterService } from './presenter.service.spec';

describe(`GetActiveUserAmountPresenterService`, () => {
    let service: GetActiveUsersAmountPresenterService;
    let presenter: MockPresenterService;

    const testMeeting = { name: `Some meeting` };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GetActiveUsersAmountPresenterService,
                { provide: PresenterService, useClass: MockPresenterService }
            ]
        });

        service = TestBed.inject(GetActiveUsersAmountPresenterService);
        presenter = TestBed.inject(PresenterService) as unknown as MockPresenterService;
        presenter.returnValueFns.set(Presenter.GET_ACTIVE_USER_AMOUNT, (data?: any) => {
            if (!data || !(typeof data === `object`) || Object.keys(data).length !== 0) {
                return { error: `MockPresenterService: Data had wrong format` };
            }
            return { returnValue: { active_users_amount: 6 } };
        });
    });

    it(`should correctly call get_active_user_amount`, async () => {
        expect(await service.call()).toBe(6);
    });
});
