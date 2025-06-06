import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { OML } from 'src/app/domain/definitions/organization-permission';
import { UserScope } from 'src/app/site/services/user.service';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface GetUserScopePresenterPayload {
    user_ids: Id[];
}

interface GetUserScopeIdentifiedScope {
    collection: UserScope;
    id: Id;
    user_oml: OML | ``;
    committee_ids: number[];
    user_in_archived_meetings_only: boolean;
    home_committee_id: Id;
}

export type GetUserScopePresenterResult = Record<Id, GetUserScopeIdentifiedScope>;

@Injectable({
    providedIn: `root`
})
export class GetUserScopePresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(payload: GetUserScopePresenterPayload): Promise<GetUserScopePresenterResult> {
        return await this.presenter.call(Presenter.GET_USER_SCOPE, payload);
    }
}
