import { inject, Injectable } from '@angular/core';
import { PollBallot } from '@app/domain/models/poll/poll-ballot';
import { PollBallotRepositoryService } from '@app/gateways/repositories/polls/poll-ballot-repository.service';
import { BaseMeetingControllerService } from '@app/site/pages/meetings/base/base-meeting-controller.service';

import { ViewPollBallot } from '../../../../pages/polls/view-models/poll-ballot';

@Injectable({
    providedIn: `root`
})
export class PollBallotControllerService extends BaseMeetingControllerService<ViewPollBallot, PollBallot> {
    protected repo = inject(PollBallotRepositoryService);

    protected baseModelCtor = PollBallot;
}
