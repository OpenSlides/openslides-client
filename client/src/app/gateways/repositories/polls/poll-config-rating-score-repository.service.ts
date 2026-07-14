import { Injectable } from '@angular/core';
import { PollConfigRatingScore } from '@app/domain/models/poll/poll-config-rating-score';
import { ViewPollConfigRatingScore } from '@app/site/pages/meetings/pages/polls/view-models/poll-config-rating-score';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class PollConfigRatingScoreRepositoryService extends BaseMeetingRelatedRepository<
    ViewPollConfigRatingScore,
    PollConfigRatingScore
> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PollConfigRatingScore);
    }

    public getTitle = (_viewPollConfigRatingScore: ViewPollConfigRatingScore): string => `Rating score poll config`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Rating score poll configs` : `Rating score poll config`);
}
