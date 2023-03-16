import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { Tag } from 'src/app/domain/models/tag/tag';
import { ViewTag } from 'src/app/site/pages/meetings/pages/motions';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';
import { TagAction } from './tag.action';

@Injectable({
    providedIn: `root`
})
export class TagRepositoryService extends BaseMeetingRelatedRepository<ViewTag, Tag> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, Tag);
        this.initSorting();
    }

    public async create(...tags: Partial<Tag>[]): Promise<Identifiable[]> {
        const payload: any[] = tags.map(tag => this.getCreatePayload(tag));
        return this.sendBulkActionToBackend(TagAction.CREATE, payload);
    }

    public async update(update: Partial<Tag>, viewModel: Identifiable): Promise<void> {
        const payload = { id: viewModel.id, name: update.name };
        return this.sendActionToBackend(TagAction.UPDATE, payload);
    }

    public async delete(...tags: Identifiable[]): Promise<void> {
        const payload: Identifiable[] = tags.map(tag => ({ id: tag.id }));
        return this.sendBulkActionToBackend(TagAction.DELETE, payload);
    }

    public getTitle = (viewTag: ViewTag) => viewTag.name;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Tags` : `Tag`);

    /**
     * Sets the default sorting (e.g. in dropdowns and for new users) to 'name'
     */
    private initSorting(): void {
        this.setSortFunction((a: ViewTag, b: ViewTag) => this.languageCollator.compare(a.name, b.name));
    }

    private getCreatePayload(partialTag: Partial<Tag>): any {
        return {
            name: partialTag.name,
            meeting_id: this.activeMeetingId
        };
    }
}
