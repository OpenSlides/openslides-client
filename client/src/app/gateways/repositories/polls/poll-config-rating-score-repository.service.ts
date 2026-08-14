import { Injectable } from '@angular/core';
import { PollConfigRatingScore } from '@app/domain/models/poll/poll-config-rating-score';
import { ViewPollConfigRatingScore } from '@app/site/pages/meetings/pages/polls/view-models/poll-config-rating-score';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';

@Injectable({
    providedIn: `root`
})
export class PollConfigRatingScoreRepositoryService extends BaseMeetingRelatedRepository<
    ViewPollConfigRatingScore,
    PollConfigRatingScore
> {
    protected baseModelCtor = PollConfigRatingScore;

    public getTitle = (_viewPollConfigRatingScore: ViewPollConfigRatingScore): string => `Rating score poll config`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Rating score poll configs` : `Rating score poll config`);
}
