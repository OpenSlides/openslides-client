import { Directive, Input } from '@angular/core';
import { PollBackendDurationChoices } from '@app/domain/models/poll/poll-constants';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls';

@Directive()
export abstract class BasePollMetaInformationComponent {
    public readonly POLL_BACKEND_DURATION_LABEL = PollBackendDurationChoices;

    @Input()
    public poll!: ViewPoll;
}
