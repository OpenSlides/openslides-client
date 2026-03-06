import { Injectable } from '@angular/core';
import { PollConfigOption } from 'src/app/domain/models/poll/poll-config-option';
import { ViewPollConfigOption } from 'src/app/site/pages/meetings/pages/polls/view-models/poll-config-option';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class PollConfigOptionRepositoryService extends BaseMeetingRelatedRepository<
    ViewPollConfigOption,
    PollConfigOption
> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PollConfigOption);
    }

    public getTitle = (_viewPollConfigOption: ViewPollConfigOption): string => `Poll config option`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Poll config options` : `Poll config option`);
}
