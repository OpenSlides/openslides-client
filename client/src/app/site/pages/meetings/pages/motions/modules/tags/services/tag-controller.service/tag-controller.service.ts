import { Injectable } from '@angular/core';
import { Identifiable } from 'src/app/domain/interfaces';
import { Tag } from 'src/app/domain/models/tag/tag';
import { TagRepositoryService } from 'src/app/gateways/repositories/tags/tag-repository.service';
import { BaseMeetingControllerService } from 'src/app/site/pages/meetings/base/base-meeting-controller.service';
import { MeetingControllerServiceCollectorService } from 'src/app/site/pages/meetings/services/meeting-controller-service-collector.service';

import { ViewTag } from '../../view-models';

@Injectable({
    providedIn: `root`
})
export class TagControllerService extends BaseMeetingControllerService<ViewTag, Tag> {
    public constructor(
        controllerServiceCollector: MeetingControllerServiceCollectorService,
        protected override repo: TagRepositoryService
    ) {
        super(controllerServiceCollector, Tag, repo);
    }

    public create(...tags: Partial<Tag>[]): Promise<Identifiable[]> {
        return this.repo.create(...tags);
    }

    public update(update: Partial<Tag>, tag: Identifiable): Promise<void> {
        return this.repo.update(update, tag);
    }

    public delete(...tags: Identifiable[]): Promise<void> {
        return this.repo.delete(...tags);
    }
}
