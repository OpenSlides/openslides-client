import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { User } from 'src/app/domain/models/users/user';
import { Action } from 'src/app/gateways/actions';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { UserRepositoryService } from '../users';
import { UserAction } from '../users/user-action';

@Injectable({
    providedIn: `root`
})
export class ParticipantRepositoryService extends BaseMeetingRelatedRepository<ViewUser, User> {
    constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        private userRepo: UserRepositoryService
    ) {
        super(repositoryServiceCollector, User);
    }

    public override getViewModel(participantId: Id): ViewUser | null {
        return this.userRepo.getViewModel(participantId);
    }

    public override getViewModelObservable(id: Id): Observable<ViewUser | null> {
        return this.userRepo.getViewModelObservable(id);
    }

    public override getViewModelList(): ViewUser[] {
        return this.userRepo.getViewModelList();
    }

    public override getViewModelListObservable(): Observable<ViewUser[]> {
        return this.userRepo.getViewModelListObservable();
    }

    public getVerboseName = (plural?: boolean): string => this.userRepo.getVerboseName(plural);

    public getTitle = (user: ViewUser): string => this.userRepo.getTitle(user);

    public togglePresenceByNumber(...numbers: string[]): Promise<Identifiable[]> {
        const payload = numbers.map(number => ({
            meeting_id: this.activeMeetingId,
            number
        }));
        return this.createAction<Identifiable>(UserAction.TOGGLE_PRESENCE_BY_NUMBER, payload).resolve() as any;
    }

    public bulkAddGroupsToUsers(users: ViewUser[], groupIds: Id[]): Promise<void> {
        this.userRepo.preventAlterationOnDemoUsers(users);
        const patchFn = (user: ViewUser) => {
            groupIds = groupIds.concat(user.group_ids());
            return {
                id: user.id,
                group_ids: groupIds.filter((groupId, index, self) => self.indexOf(groupId) === index)
            };
        };
        return this.userRepo.update(patchFn, ...users).resolve() as Promise<void>;
    }

    public bulkRemoveGroupsFromUsers(users: ViewUser[], groupIds: Id[]): Promise<void> {
        this.userRepo.preventAlterationOnDemoUsers(users);
        const patchFn = (user: ViewUser) => ({
            id: user.id,
            group_ids: user.group_ids().filter(groupId => !groupIds.includes(groupId))
        });
        return this.userRepo.update(patchFn, ...users).resolve() as Promise<void>;
    }

    public setPresent(isPresent: boolean, ...users: ViewUser[]): Action<void> {
        this.userRepo.preventAlterationOnDemoUsers(users);
        const payload: any[] = users.map(user => ({
            id: user.id,
            meeting_id: this.activeMeetingId,
            present: isPresent
        }));
        return this.actions.create({ action: UserAction.SET_PRESENT, data: payload });
    }

    public override getFieldsets(): Fieldsets<User> {
        return this.userRepo.getFieldsets();
    }
}
