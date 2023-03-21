import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { User } from 'src/app/domain/models/users/user';
import { ORGANIZATION_ID } from 'src/app/site/pages/organization/services/organization.service';
import { UserScope } from 'src/app/site/services/user.service';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface SearchCriteria {
    username?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
}

interface PresenterData {
    permission_type: UserScope;
    permission_id: number; // Id of object, organization's id is the 1
    search: SearchCriteria[];
}

type PresenterResult = Partial<User>[][];

@Injectable({ providedIn: `root` })
export class SearchUsersPresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(
        {
            permissionScope = UserScope.MEETING,
            permissionRelatedId,
            searchCriteria
        }: {
            permissionScope?: UserScope;
            permissionRelatedId?: Id;
            searchCriteria: SearchCriteria[];
        },
        minimizePayload = true
    ): Promise<PresenterResult> {
        if (!permissionRelatedId && permissionScope === UserScope.ORGANIZATION) {
            permissionRelatedId = ORGANIZATION_ID;
        }
        return await this.presenter.call<PresenterResult, PresenterData>(Presenter.SEARCH_USERS, {
            permission_type: permissionScope,
            permission_id: permissionRelatedId,
            search: minimizePayload ? this.minimizeSearchCriteria(searchCriteria) : searchCriteria
        });
    }

    /**
     * Shorthand to call the presenter for a list of users. The users' usernames, first names, last
     * names and emails are automatically used for the search. Does not change the order of the
     * arguments nor results.
     */
    public async callForUsers(
        {
            permissionScope = UserScope.MEETING,
            permissionRelatedId,
            users
        }: {
            permissionScope?: UserScope;
            permissionRelatedId?: Id;
            users: Partial<User>[];
        },
        minimizePayload = true
    ): Promise<PresenterResult> {
        return await this.call(
            {
                permissionScope,
                permissionRelatedId,
                searchCriteria: users.map(entry => ({
                    username: entry.username,
                    first_name: entry.first_name,
                    last_name: entry.last_name,
                    email: entry.email
                }))
            },
            minimizePayload
        );
    }

    private minimizeSearchCriteria(searchCriteria: SearchCriteria[]): SearchCriteria[] {
        const data: SearchCriteria[] = [];
        searchCriteria.forEach(criteria => {
            if (
                !data.find(
                    date =>
                        date.username === criteria.username &&
                        date.first_name === criteria.first_name &&
                        date.last_name == criteria.last_name &&
                        date.email === criteria.email
                )
            ) {
                data.push(criteria);
            }
        });
        return data;
    }
}
