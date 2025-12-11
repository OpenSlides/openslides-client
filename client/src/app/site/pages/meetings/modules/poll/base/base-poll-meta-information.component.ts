import { Directive, Input } from '@angular/core';
import { PollBackendDurationChoices, RequiredMajorityBaseVerbose } from 'src/app/domain/models/poll/poll-constants';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

@Directive()
export abstract class BasePollMetaInformationComponent {
    public readonly POLL_BACKEND_DURATION_LABEL = PollBackendDurationChoices;

    @Input()
    public poll!: ViewPoll;

    public get requiredMajorityVerbose(): string {
        return RequiredMajorityBaseVerbose[this.poll.required_majority];
    }
}
