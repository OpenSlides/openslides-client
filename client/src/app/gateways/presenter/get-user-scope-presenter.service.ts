import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { OML } from '@app/domain/definitions/organization-permission';
import { UserScope } from '@app/site/services/user.service';

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

@Service()
export class GetUserScopePresenterService {
    private presenter = inject(PresenterService);

    public async call(payload: GetUserScopePresenterPayload): Promise<GetUserScopePresenterResult> {
        return await this.presenter.call(Presenter.GET_USER_SCOPE, payload);
    }
}
