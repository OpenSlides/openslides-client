import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ViewUser } from 'app/site/users/models/view-user';
import { HttpService } from './http.service';
import { Id } from '../definitions/key-types';
import { SimplifiedModelRequest } from './model-request-builder.service';
import { UserRepositoryService } from '../repositories/users/user-repository.service';
import { OperatorService } from './operator.service';
import { OML } from './organization-permission';

export interface GetUsersRequest {
    users: Id[];
}

@Injectable({
    providedIn: 'root'
})
export class MemberService {
    public constructor(
        private userRepo: UserRepositoryService,
        private http: HttpService,
        private operator: OperatorService
    ) {}

    public getMemberListObservable(): Observable<ViewUser[]> {
        return this.userRepo.getViewModelListObservable();
    }

    /**
     * This function fetches from the backend a specified amount of ids from all orga-wide stored users.
     *
     * @param start_index The index of the first id
     * @param entries The amount of ids
     *
     * @returns A list of ids from users
     */
    public async fetchAllOrgaUsers(start_index: number = 0, entries: number = 10000): Promise<Id[]> {
        if (!this.operator.hasOrganizationPermissions(OML.can_manage_users)) {
            return [];
        }
        const payload = [
            {
                presenter: 'get_users',
                data: {
                    start_index,
                    entries
                }
            }
        ];
        const response = await this.http.post<GetUsersRequest[]>('/system/presenter/handle_request', payload);
        return response[0].users;
    }

    /**
     * Fetches a specified amount of ids from all orga-wide stored users and creates a `SimplifiedModelRequest` to
     * follow them and receive autoupdates.
     *
     * @param start_index The index of the first id
     * @param entries The amount of ids
     *
     * @returns A promise resolving a `SimplifiedModelRequest`
     */
    public async getAllOrgaUsersModelRequest(
        start_index: number = 0,
        entries: number = 10000
    ): Promise<SimplifiedModelRequest> {
        const userIds = await this.fetchAllOrgaUsers(start_index, entries);
        return {
            viewModelCtor: ViewUser,
            ids: userIds,
            fieldset: 'orgaList',
            follow: [{ idField: 'committee_ids' }, { idField: 'is_present_in_meeting_ids' }]
        };
    }
}
