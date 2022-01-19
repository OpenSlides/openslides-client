import { Injectable } from '@angular/core';
import { Id } from 'app/core/definitions/key-types';

import { ActiveMeetingService } from '../active-meeting.service';
import { Presenter, PresenterService } from '../presenter.service';

interface SearchCriteria {
    email?: string;
    username?: string;
}

interface PresenterData {
    permission_type: number; // 1=meeting, 2=committee, 3=organization
    permission_id: number; // Id of object, organization's id is the 1
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
    private get activeMeetingId(): Id {
        return this.activeMeeting.meetingId;
    }

    public constructor(private presenter: PresenterService, private activeMeeting: ActiveMeetingService) {}

    public async call({
        permissionScope = SearchUsersByNameOrEmailPresenterScope.MEETING,
        permissionRelatedId = this.activeMeetingId,
        searchCriteria
    }: {
        permissionScope?: SearchUsersByNameOrEmailPresenterScope;
        permissionRelatedId?: Id;
        searchCriteria: SearchCriteria[];
    }): Promise<PresenterResult> {
        return await this.presenter.call<PresenterResult, PresenterData>(Presenter.SEARCH_USERS_BY_NAME_OR_EMAIL, {
            permission_type: permissionScope,
            permission_id: permissionRelatedId,
            search: searchCriteria
        });
    }
}
