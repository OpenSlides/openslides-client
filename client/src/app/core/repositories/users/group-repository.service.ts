import { Injectable } from '@angular/core';
import { GroupAction } from 'app/core/actions/group-action';
import {
    DEFAULT_FIELDSET,
    Fieldsets,
    SimplifiedModelRequest
} from 'app/core/core-services/model-request-builder.service';
import { Permission } from 'app/core/core-services/permission';
import { Id } from 'app/core/definitions/key-types';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Group } from 'app/shared/models/users/group';
import { ViewGroup } from 'app/site/users/models/view-group';
import { Observable, OperatorFunction } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { ModelRequestRepository } from '../model-request-repository';
import { RepositoryServiceCollector } from '../repository-service-collector';

export class MeetingGroupsObject {
    public readonly groups: { [groupName: string]: ViewGroup };
    public readonly defaultGroup: ViewGroup;
    public readonly adminGroup: ViewGroup;

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

/**
 * Repository service for Groups
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: `root`
})
export class GroupRepositoryService
    extends BaseRepositoryWithActiveMeeting<ViewGroup, Group>
    implements ModelRequestRepository
{
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Group);
    }

    public getFieldsets(): Fieldsets<Group> {
        const titleFields: (keyof Group)[] = [`name`];
        const listFields: (keyof Group)[] = titleFields.concat([`permissions`]);
        const detailFields: (keyof Group)[] = listFields.concat([
            `admin_group_for_meeting_id`,
            `default_group_for_meeting_id`,
            `weight`
        ]);
        return {
            title: titleFields,
            list: listFields,
            [DEFAULT_FIELDSET]: detailFields
        };
    }

    public getTitle = (viewGroup: ViewGroup) => viewGroup.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Groups` : `Group`);

    public getNameForIds(...ids: number[]): string {
        return this.getSortedViewModelList()
            .filter(group => ids.includes(group.id))
            .map(group => this.translate.instant(group.getTitle()))
            .join(`, `);
    }

    public create(...groups: GroupAction.CreateParameters[]): Promise<Identifiable[]> {
        const payload: GroupAction.CreatePayload[] = groups.map(group => this.getCreatePayload(group));
        return this.sendBulkActionToBackend(GroupAction.CREATE, payload);
    }

    public update(update: Partial<Group>, group: ViewGroup): Promise<void> {
        const payload: GroupAction.UpdatePayload = {
            id: group.id,
            name: update.name
        };
        return this.sendActionToBackend(GroupAction.UPDATE, payload);
    }

    public delete(group: ViewGroup): Promise<void> {
        return this.sendActionToBackend(GroupAction.DELETE, { id: group.id });
    }

    /**
     * Toggles the given permisson.
     *
     * @param group The group
     * @param permission The permission to toggle
     */
    public async togglePermission(group: ViewGroup, permission: Permission): Promise<void> {
        const payload: GroupAction.SetPermissionPayload = {
            id: group.id,
            permission,
            set: !group.permissions.includes(permission)
        };
        return this.sendActionToBackend(GroupAction.SET_PERMISSION, payload);
    }

    public getFilterDefaultGroupFn(): OperatorFunction<ViewGroup[], ViewGroup[]> {
        return map(groups => groups.filter(group => !group.isDefaultGroup));
    }

    /**
     * Returns an Observable for all groups except the default group.
     */
    public getViewModelListObservableWithoutDefaultGroup(): Observable<ViewGroup[]> {
        return this.getViewModelListObservable().pipe(this.getFilterDefaultGroupFn());
    }

    public getGroupsForActiveMeeting(): MeetingGroupsObject {
        if (!this.activeMeeting) {
            throw new Error(`There is no active meeting`);
        }
        return new MeetingGroupsObject(this.activeMeeting.groups, this.activeMeetingId);
    }

    public getRequestToGetAllModels(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [{ idField: `group_ids`, fieldset: `title` }]
        };
    }

    private getCreatePayload(partialGroup: Partial<GroupAction.CreatePayload>): GroupAction.CreatePayload {
        return {
            meeting_id: this.activeMeetingId,
            name: partialGroup.name,
            permissions: partialGroup.permissions
        };
    }
}
