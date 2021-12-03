import { Directive, Input } from '@angular/core';

import { PollBackendDurationChoices } from '../../../shared/models/poll/poll-constants';
import { ViewPoll } from '../../../shared/models/poll/view-poll';

@Directive()
export abstract class BasePollMetaInformationComponent {
    public readonly POLL_BACKEND_DURATION_LABEL = PollBackendDurationChoices;

    @Input()
    public poll: ViewPoll;
}
