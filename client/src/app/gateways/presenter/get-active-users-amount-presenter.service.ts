import { inject, Service } from '@angular/core';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface GetActiveUsersPresenterResult {
    active_users_amount: number;
}

@Service()
export class GetActiveUsersAmountPresenterService {
    private presenter = inject(PresenterService);

    public async call(): Promise<number> {
        const response = await this.presenter.call<GetActiveUsersPresenterResult>(Presenter.GET_ACTIVE_USER_AMOUNT, {});
        return response.active_users_amount;
    }
}
