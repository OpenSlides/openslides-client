import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { GroupAction } from 'app/core/actions/group-action';
import { HttpService } from 'app/core/core-services/http.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Permission } from 'app/core/core-services/permission';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Group } from 'app/shared/models/users/group';
import { ViewGroup } from 'app/site/users/models/view-group';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository service for Groups
 *
 * Documentation partially provided in {@link BaseRepository}
 */
@Injectable({
    providedIn: 'root'
})
export class GroupRepositoryService extends BaseRepositoryWithActiveMeeting<ViewGroup, Group> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector, private http: HttpService) {
        super(repositoryServiceCollector, Group);
    }

    public getFieldsets(): Fieldsets<Group> {
        const titleFields: (keyof Group)[] = ['name'];
        const listFields: (keyof Group)[] = titleFields.concat(['permissions']);
        const detailFields: (keyof Group)[] = listFields.concat([
            'superadmin_group_for_meeting_id',
            'default_group_for_meeting_id'
        ]);
        return {
            title: titleFields,
            list: listFields,
            [DEFAULT_FIELDSET]: detailFields
        };
    }

    public getTitle = (viewGroup: ViewGroup) => {
        return viewGroup.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Groups' : 'Group');
    };

    public getNameForIds(...ids: number[]): string {
        return this.getSortedViewModelList()
            .filter(group => ids.includes(group.id))
            .map(group => this.translate.instant(group.getTitle()))
            .join(', ');
    }

    public create(group: GroupAction.CreateParameters): Promise<Identifiable> {
        const payload: GroupAction.CreatePayload = {
            ...group,
            meeting_id: this.activeMeetingIdService.meetingId
        };
        return this.sendActionToBackend(GroupAction.CREATE, payload);
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

    /**
     * Returns an Observable for all groups except the default group.
     */
    public getViewModelListObservableWithoutDefaultGroup(): Observable<ViewGroup[]> {
        // since groups are sorted by id, default is always the first entry
        return this.getViewModelListObservable().pipe(map(groups => groups.slice(1)));
    }
}
