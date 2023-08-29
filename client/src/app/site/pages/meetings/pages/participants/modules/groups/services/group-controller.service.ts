import { Injectable } from '@angular/core';
import { map, Observable, OperatorFunction } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { Identifiable } from 'src/app/domain/interfaces';
import { Group } from 'src/app/domain/models/users/group';
import { GroupRepositoryService } from 'src/app/gateways/repositories/groups';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewGroup } from '../view-models';

export class MeetingGroupsObject {
    public readonly groups: { [groupName: string]: ViewGroup };
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

@Injectable({
    providedIn: `root`
})
export class GroupControllerService extends BaseMeetingControllerService<ViewGroup, Group> {
    public constructor(
        repositoryServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: GroupRepositoryService
    ) {
        super(repositoryServiceCollector, ViewGroup, repo);
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

    /**
     * Returns an Observable for all groups except the default group.
     */
    public getViewModelListWithoutDefaultGroupObservable(): Observable<ViewGroup[]> {
        return this.getViewModelListObservable().pipe(this.getFilterDefaultGroupFn());
    }

    public getNameForIds(...ids: number[]): string {
        return this.repo
            .getSortedViewModelListViaSortFn()
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
