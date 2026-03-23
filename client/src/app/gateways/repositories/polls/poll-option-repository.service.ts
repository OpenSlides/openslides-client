import { Injectable } from '@angular/core';
import { PollOption } from 'src/app/domain/models/poll/poll-option';
import { ViewPollOption } from 'src/app/site/pages/meetings/pages/polls/view-models/poll-option';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class PollOptionRepositoryService extends BaseMeetingRelatedRepository<ViewPollOption, PollOption> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PollOption);
    }

    public getTitle = (_viewPollConfigOption: ViewPollOption): string => `Poll config option`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Poll config options` : `Poll config option`);
}
