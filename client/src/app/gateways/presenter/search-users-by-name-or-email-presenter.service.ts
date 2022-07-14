import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';

import { Presenter } from './presenter';
import { PresenterService } from './presenter.service';

interface SearchCriteria {
    email?: string;
    username?: string;
}

interface PresenterData {
    permission_type: number; // 1=meeting, 2=committee, 3=organization
    permission_id?: number; // Id of object, organization's id is the 1
    search: {
        username?: string;
        email?: string;
    }[];
}

interface PresenterResult {
    [username_email: string]: // Resulting in <username>/<email>. The slash is always given.
    {
        id: Id;
        first_name: string;
        last_name: string;
        email: string;
    }[];
}

export enum SearchUsersByNameOrEmailPresenterScope {
    MEETING = 1,
    COMMITTEE,
    ORGANIZATION
}

@Injectable({ providedIn: `root` })
export class SearchUsersByNameOrEmailPresenterService {
    public constructor(private presenter: PresenterService) {}

    public async call(
        {
            permissionScope = SearchUsersByNameOrEmailPresenterScope.MEETING,
            permissionRelatedId,
            searchCriteria
        }: {
            permissionScope?: SearchUsersByNameOrEmailPresenterScope;
            permissionRelatedId?: Id;
            searchCriteria: SearchCriteria[];
        },
        minimizePayload = true
    ): Promise<PresenterResult> {
        return await this.presenter.call<PresenterResult, PresenterData>(Presenter.SEARCH_USERS_BY_NAME_OR_EMAIL, {
            permission_type: permissionScope,
            permission_id: permissionRelatedId,
            search: minimizePayload ? this.minimizeSearchCriteria(searchCriteria) : searchCriteria
        });
    }

    private minimizeSearchCriteria(searchCriteria: SearchCriteria[]): SearchCriteria[] {
        const data: SearchCriteria[] = [];
        searchCriteria.forEach(criteria => {
            if (!data.find(date => date.username === criteria.username && date.email === criteria.email)) {
                data.push(criteria);
            }
        });
        return data;
    }
}
