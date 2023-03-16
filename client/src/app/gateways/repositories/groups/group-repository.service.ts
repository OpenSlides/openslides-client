import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { Group } from 'src/app/domain/models/users/group';
import { BaseMeetingRelatedRepository } from 'src/app/gateways/repositories/base-meeting-related-repository';
import { ViewGroup } from 'src/app/site/pages/meetings/pages/participants';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { GroupAction } from './group.action';

@Injectable({
    providedIn: `root`
})
export class GroupRepositoryService extends BaseMeetingRelatedRepository<ViewGroup, Group> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, Group);
    }

    public override getFieldsets(): Fieldsets<Group> {
        const titleFields: (keyof Group)[] = [`name`];
        const listFields: (keyof Group)[] = titleFields.concat([`permissions`]);
        return {
            title: titleFields,
            list: listFields,
            ...super.getFieldsets()
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

    public create(...groups: Partial<Group>[]): Promise<Identifiable[]> {
        const payload = groups.map(group => this.getCreatePayload(group));
        return this.sendBulkActionToBackend(GroupAction.CREATE, payload);
    }

    public update(update: Partial<Group>, group: Identifiable): Promise<void> {
        const payload = {
            id: group.id,
            name: update.name
        };
        return this.sendActionToBackend(GroupAction.UPDATE, payload);
    }

    public bulkUpdate(...update: Partial<Group>[]): Promise<any> {
        return this.createAction(GroupAction.UPDATE, update).resolve();
    }

    public delete(group: Identifiable): Promise<void> {
        return this.sendActionToBackend(GroupAction.DELETE, { id: group.id });
    }

    private getCreatePayload(partialGroup: Partial<Group>): Partial<Group> {
        return {
            meeting_id: this.activeMeetingId!,
            name: partialGroup.name,
            permissions: partialGroup.permissions
        };
    }
}
