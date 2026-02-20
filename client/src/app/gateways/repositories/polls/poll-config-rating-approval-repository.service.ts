import { Injectable } from '@angular/core';
import { PollConfigRatingApproval } from 'src/app/domain/models/poll/poll-config-rating-approval';
import { ViewPollConfigRatingApproval } from 'src/app/site/pages/meetings/pages/polls/view-models/poll-config-rating-approval';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class PollConfigRatingApprovalRepositoryService extends BaseMeetingRelatedRepository<
    ViewPollConfigRatingApproval,
    PollConfigRatingApproval
> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PollConfigRatingApproval);
    }

    public getTitle = (_viewPollConfigRatingApproval: ViewPollConfigRatingApproval): string =>
        `Rating approval poll config`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Rating approval poll configs` : `Rating approval poll config`);
}
