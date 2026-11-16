import { Injectable } from '@angular/core';
import { PollConfigRatingApproval } from '@app/domain/models/poll/poll-config-rating-approval';
import { ViewPollConfigRatingApproval } from '@app/site/pages/meetings/pages/polls/view-models/poll-config-rating-approval';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';

@Injectable({
    providedIn: `root`
})
export class PollConfigRatingApprovalRepositoryService extends BaseMeetingRelatedRepository<
    ViewPollConfigRatingApproval,
    PollConfigRatingApproval
> {
    protected baseModelCtor = PollConfigRatingApproval;

    public getTitle = (_viewPollConfigRatingApproval: ViewPollConfigRatingApproval): string =>
        `Rating approval poll config`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Rating approval poll configs` : `Rating approval poll config`);
}
