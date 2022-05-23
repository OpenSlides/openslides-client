import { Injectable } from '@angular/core';

import { Id } from '../../domain/definitions/key-types';
import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface GetUsersPresenterResult {
    users: Id[];
}

interface GetUsersPresenterPayload {
    start_index?: number;
    entries?: number;
}

@Injectable({
    providedIn: `root`
})
export class GetUsersPresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call({ start_index = 0, entries = 1000 }: GetUsersPresenterPayload): Promise<Id[]> {
        const response = await this.presenter.call<GetUsersPresenterResult>(Presenter.GET_USERS, {
            start_index,
            entries
        });
        return response.users;
    }
}
