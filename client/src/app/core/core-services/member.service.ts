import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ViewUser } from 'app/site/users/models/view-user';
import { HttpService } from './http.service';
import { Id } from '../definitions/key-types';
import { UserRepositoryService } from '../repositories/users/user-repository.service';

export interface GetUsersRequest {
    users: Id[];
}

@Injectable({
    providedIn: 'root'
})
export class MemberService {
    public constructor(private userRepo: UserRepositoryService, private http: HttpService) {}

    public getMemberListObservable(): Observable<ViewUser[]> {
        return this.userRepo.getViewModelListObservable().pipe(map(users => users.filter(user => !user.isTemporary)));
    }

    public async fetchAllOrgaUsers(start_index: number = 0, entries: number = 10000): Promise<Id[]> {
        const payload = [
            {
                presenter: 'get_users',
                data: {
                    start_index,
                    entries,
                    include_temporary: true
                }
            }
        ];
        const response = await this.http.post<GetUsersRequest[]>('/system/presenter/handle_request', payload);
        return response[0].users;
    }
}
