import { inject, Service } from '@angular/core';
import { Option } from '@app/domain/models/poll/option';
import { ViewOption } from '@app/site/pages/meetings/pages/polls';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../../repository-meeting-service-collector.service';

@Service()
export class OptionRepositoryService extends BaseMeetingRelatedRepository<ViewOption, Option> {
    public constructor() {
        const repositoryServiceCollector = inject(RepositoryMeetingServiceCollectorService);
        super(repositoryServiceCollector, Option);
    }

    public getTitle = (_viewOption: ViewOption): string => `Option`;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Options` : `Option`);
}
