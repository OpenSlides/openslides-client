import { Injectable } from '@angular/core';
import { PollConfigApproval } from 'src/app/domain/models/poll/poll-config-approval';
import { ViewPollConfigApproval } from 'src/app/site/pages/meetings/pages/polls/view-models/poll-config-approval';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class PollConfigApprovalRepositoryService extends BaseMeetingRelatedRepository<
    ViewPollConfigApproval,
    PollConfigApproval
> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PollConfigApproval);
    }

    public getTitle = (_viewPollConfigApproval: ViewPollConfigApproval): string => `Approval poll config`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Approval poll configs` : `Approval poll config`);
}
