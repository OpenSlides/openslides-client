import { Injectable } from '@angular/core';
import { PollBallotUser } from '@app/domain/models/poll/poll-ballot-user';
import { ViewPollBallotUser } from '@app/site/pages/meetings/pages/polls/view-models/poll-ballot-user';

import { BaseMeetingRelatedRepository } from '../base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from '../repository-meeting-service-collector.service';

@Injectable({
    providedIn: `root`
})
export class PollBallotUserRepositoryService extends BaseMeetingRelatedRepository<ViewPollBallotUser, PollBallotUser> {
    public constructor(repositoryServiceCollector: RepositoryMeetingServiceCollectorService) {
        super(repositoryServiceCollector, PollBallotUser);
    }

    public getTitle = (viewBallotUser: ViewPollBallotUser): string => viewBallotUser.user?.getTitle() ?? `Unknown`;

    public getVerboseName = (plural = false): string =>
        this.translate.instant(plural ? `Ballot users` : `Ballot users`);
}
