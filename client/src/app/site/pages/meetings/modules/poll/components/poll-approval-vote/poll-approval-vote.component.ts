import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ViewPoll } from '../../../../pages/polls';
import { PollComponent } from '../poll/poll.component';

@Component({
    selector: 'os-poll-approval-vote',
    imports: [PollComponent],
    templateUrl: './poll-approval-vote.component.html',
    styleUrl: './poll-approval-vote.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollApprovalVoteComponent {
    public poll = input.required<ViewPoll>();
}
