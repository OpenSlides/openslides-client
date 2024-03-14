import { Injectable } from '@angular/core';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface GetActiveUsersPresenterResult {
    active_users_amount: number;
}

@Injectable({
    providedIn: `root`
})
export class GetActiveUsersAmountPresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(): Promise<number> {
        const response = await this.presenter.call<GetActiveUsersPresenterResult>(Presenter.GET_ACTIVE_USER_AMOUNT, {});
        return response.active_users_amount;
    }
}
