import { inject, Service } from '@angular/core';
import { Id } from '@app/domain/definitions/key-types';
import { Identifiable } from '@app/domain/interfaces';
import { Group } from '@app/domain/models/users/group';
import { GroupRepositoryService } from '@app/gateways/repositories/groups';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from '@app/site/pages/meetings/services/meeting-controller-service-collector.service';
import { map, Observable, OperatorFunction } from 'rxjs';

import { ViewGroup } from '../view-models';

export class MeetingGroupsObject {
    public readonly groups: Record<string, ViewGroup>;
    public readonly defaultGroup!: ViewGroup;
    public readonly adminGroup!: ViewGroup;

    public constructor(groups: ViewGroup[], meetingId: Id) {
        this.groups = groups.mapToObject(group => ({ [group.name]: group }));
        for (const group of groups) {
            if (group.admin_group_for_meeting_id === meetingId) {
                this.adminGroup = group;
            }
            if (group.default_group_for_meeting_id === meetingId) {
                this.defaultGroup = group;
            }
        }
    }
}

@Service()
export class GroupControllerService extends BaseMeetingControllerService<ViewGroup, Group> {
    protected override repo: GroupRepositoryService;

    public constructor() {
        const repositoryServiceCollector = inject(MeetingControllerServiceCollectorService);
        const repoForSuper = inject(GroupRepositoryService);
        super(repositoryServiceCollector, ViewGroup, repoForSuper);
        this.repo = repoForSuper;
    }

    public create(...groups: Partial<Group>[]): Promise<Identifiable[]> {
        return this.repo.create(...groups);
    }

    public update(update: Partial<Group>, group: Identifiable): Promise<void> {
        return this.repo.update(update, group);
    }

    public bulkUpdate(...update: Partial<Group>[]): Promise<any> {
        return this.repo.bulkUpdate(...update);
    }

    public delete(group: Identifiable): Promise<void> {
        return this.repo.delete(group);
    }

    public getGeneralViewModelObservable(): Observable<ViewGroup> {
        return this.repo.getGeneralViewModelObservable();
    }

    public getFilterDefaultGroupFn(): OperatorFunction<ViewGroup[], ViewGroup[]> {
        return map(groups => groups.filter(group => !group.isDefaultGroup));
    }

    public getFilterSystemGroupFn(): OperatorFunction<ViewGroup[], ViewGroup[]> {
        return map(groups => groups.filter(group => !group.isDefaultGroup && !group.isAnonymousGroup));
    }

    public getFilterAnonymousGroupFn(): OperatorFunction<ViewGroup[], ViewGroup[]> {
        return map(groups => groups.filter(group => !group.isAnonymousGroup));
    }

    /**
     * Returns an Observable for all groups except the default and anonymous group.
     */
    public getViewModelListWithoutSystemGroupsObservable(): Observable<ViewGroup[]> {
        return this.getViewModelListObservable().pipe(this.getFilterSystemGroupFn());
    }

    /**
     * Returns an Observable for all groups except the anonymous group.
     */
    public getViewModelListWithoutAnonymousGroupObservable(): Observable<ViewGroup[]> {
        return this.getViewModelListObservable().pipe(this.getFilterAnonymousGroupFn());
    }

    public getNameForIds(...ids: number[]): string {
        return this.repo
            .getSortedViewModelList()
            .filter(group => ids.includes(group.id))
            .map(group => group.getTitle())
            .join(`, `);
    }

    public getGroupsForActiveMeeting(): MeetingGroupsObject {
        if (!this.activeMeetingId || !this.activeMeeting) {
            throw new Error(`There is no active meeting`);
        }
        return new MeetingGroupsObject(this.activeMeeting.groups, this.activeMeetingId);
    }
}
