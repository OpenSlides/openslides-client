import { Injectable } from '@angular/core';
import { PollBallot } from '@app/domain/models/poll/poll-ballot';
import { ViewPollBallot } from '@app/site/pages/meetings/pages/polls';

import { BaseMeetingRelatedRepository } from '../../base-meeting-related-repository';

@Injectable({
    providedIn: `root`
})
export class PollBallotRepositoryService extends BaseMeetingRelatedRepository<ViewPollBallot, PollBallot> {
    protected baseModelCtor = PollBallot;

    public getTitle = (): string => `Vote`;

    public getVerboseName = (plural = false): string => this.translate.instant(plural ? `Votes` : `Vote`);
}
