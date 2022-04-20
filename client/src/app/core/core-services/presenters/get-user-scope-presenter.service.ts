import { Injectable } from '@angular/core';
import { Id } from 'app/core/definitions/key-types';

import { Presenter, PresenterService } from '../presenter.service';

enum UserScope {
    MEETING = `meeting`,
    COMMITTEE = `committee`,
    ORGANIZATION = `organization`
}

interface PresenterPayload {
    user_ids: Id[];
}

interface GetUserScopeIdentifiedScope {
    collection: UserScope;
    id: Id;
}

interface GetUserScopePresenterResult {
    [user_id: number]: GetUserScopeIdentifiedScope;
}

@Injectable({ providedIn: `root` })
export class GetUserScopePresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(payload: PresenterPayload): Promise<GetUserScopePresenterResult> {
        return await this.presenter.call(Presenter.GET_USER_SCOPE, payload);
    }

    /**
     * Compares two scopes and returns a number depending on the result.
     * `0` means it is equal, `1` means it is higher, `-1` means it is lower.
     *
     * @param scope A first scope
     * @param toCompare A scope to compare with the first scope
     * @returns The result of the comparison
     */
    public compareScope(scope: GetUserScopeIdentifiedScope, toCompare: GetUserScopeIdentifiedScope): number {
        if (scope.collection === toCompare.collection && scope.id === toCompare.id) {
            return 0;
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
