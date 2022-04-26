import { Injectable } from '@angular/core';
import {
    SearchUsersByNameOrEmailPresenterScope,
    SearchUsersByNameOrEmailPresenterService
} from 'app/core/core-services/presenters/search-users-by-name-or-email-presenter.service';
import { User } from 'app/shared/models/users/user';

import { Id } from '../definitions/key-types';

interface UserSearchConfig {
    permission_id?: Id;
    permission_type?: SearchUsersByNameOrEmailPresenterScope;
}

@Injectable({
    providedIn: `root`
})
export class UserSearchService {
    public constructor(private presenter: SearchUsersByNameOrEmailPresenterService) {}

    public async getDuplicates(
        entries: Partial<User>[],
        config: UserSearchConfig = {}
    ): Promise<{ [userEmailUsername: string]: Partial<User>[] }> {
        const result = await this.presenter.call({
            searchCriteria: entries.map(entry => {
                const username = !!entry.username ? entry.username : `${entry.first_name}${entry.last_name}`;
                return { username, email: entry.email };
            }),
            ...config
        });
        return result;
    }
}
