import { Injectable } from '@angular/core';
import { Option } from 'src/app/domain/models/poll/option';
import { ViewOption } from 'src/app/site/pages/meetings/pages/polls';
import { DEFAULT_FIELDSET, Fieldsets } from 'src/app/site/services/model-request-builder';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class OptionRepositoryService extends BaseMeetingRelatedRepository<ViewOption, Option> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, Option);
    }

    public getTitle = (_viewOption: ViewOption) => `Option`;

    public getVerboseName = (plural: boolean = false) => this.translate.instant(plural ? `Options` : `Option`);
}
