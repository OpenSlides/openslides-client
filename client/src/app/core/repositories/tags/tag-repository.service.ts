import { Injectable } from '@angular/core';

import { TagAction } from 'app/core/actions/tag-action';
import { ActionType } from 'app/core/core-services/action.service';
import { DEFAULT_FIELDSET, Fieldsets } from 'app/core/core-services/model-request-builder.service';
import { Identifiable } from 'app/shared/models/base/identifiable';
import { Tag } from 'app/shared/models/core/tag';
import { ViewTag } from 'app/site/tags/models/view-tag';
import { BaseRepositoryWithActiveMeeting } from '../base-repository-with-active-meeting';
import { RepositoryServiceCollector } from '../repository-service-collector';

/**
 * Repository Services for Tags
 *
 * The repository is meant to process domain objects (those found under
 * shared/models), so components can display them and interact with them.
 *
 * Rather than manipulating models directly, the repository is meant to
 * inform the {@link ActionService} about changes which will send
 * them to the Server.
 */
@Injectable({
    providedIn: 'root'
})
export class TagRepositoryService extends BaseRepositoryWithActiveMeeting<ViewTag, Tag> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector) {
        super(repositoryServiceCollector, Tag);
        this.initSorting();
    }

    public async create(partialTag: Partial<Tag>): Promise<Identifiable> {
        const payload: TagAction.CreatePayload = {
            name: partialTag.name,
            meeting_id: this.activeMeetingService.meetingId
        };
        return this.sendActionToBackend(ActionType.TAG_CREATE, payload);
    }

    public async update(update: Partial<Tag>, viewModel: ViewTag): Promise<void> {
        const payload: TagAction.UpdatePayload = {
            id: viewModel.id,
            name: update.name
        };
        return this.sendActionToBackend(ActionType.TOPIC_UPDATE, payload);
    }

    public async delete(viewModel: ViewTag): Promise<void> {
        return this.sendActionToBackend(ActionType.TOPIC_DELETE, { id: viewModel.id });
    }

    public getFieldsets(): Fieldsets<Tag> {
        return {
            [DEFAULT_FIELDSET]: ['name']
        };
    }

    public getTitle = (viewTag: ViewTag) => {
        return viewTag.name;
    };

    public getVerboseName = (plural: boolean = false) => {
        return this.translate.instant(plural ? 'Tags' : 'Tag');
    };

    /**
     * Sets the default sorting (e.g. in dropdowns and for new users) to 'name'
     */
    private initSorting(): void {
        this.setSortFunction((a: ViewTag, b: ViewTag) => {
            return this.languageCollator.compare(a.name, b.name);
        });
    }
}
