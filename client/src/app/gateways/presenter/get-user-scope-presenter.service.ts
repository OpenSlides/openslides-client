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
}

export interface GetUserScopePresenterResult {
    [user_id: Id]: GetUserScopeIdentifiedScope;
}

@Injectable({
    providedIn: `root`
})
export class GetUserScopePresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(payload: GetUserScopePresenterPayload): Promise<GetUserScopePresenterResult> {
        return await this.presenter.call(Presenter.GET_USER_SCOPE, payload);
    }

    /**
     * Compares two scopes and returns a number depending on the result.
     * `0` means it is equal, `1` means it is higher, `-1` means it is lower.
     *
     * @param scope A first scope
     * @param toCompare A scope to compare with the first scope
     * @param compareOml Whether the OML differences between the scopes should be taken into account
     * @returns The result of the comparison
     */
    public compareScope(
        scope: GetUserScopeIdentifiedScope,
        toCompare: GetUserScopeIdentifiedScope,
        compareOml = false
    ): number {
        if (scope.collection === toCompare.collection && (compareOml ? scope.user_oml === toCompare.user_oml : true)) {
            return 0;
        }
        if (compareOml) {
            if (scope.user_oml !== `` || toCompare.user_oml !== ``) {
                return scope.user_oml !== `` &&
                    (toCompare.user_oml === `` ||
                        (scope.user_oml === OML.superadmin && toCompare.user_oml !== OML.superadmin) ||
                        (scope.user_oml === OML.can_manage_organization && toCompare.user_oml === OML.can_manage_users))
                    ? 1
                    : -1;
            }
        }
        if (scope.collection === UserScope.ORGANIZATION) {
            return 1;
        }
        if (scope.collection === UserScope.COMMITTEE && toCompare.collection === UserScope.MEETING) {
            return 1;
        }
        return -1;
    }
}
