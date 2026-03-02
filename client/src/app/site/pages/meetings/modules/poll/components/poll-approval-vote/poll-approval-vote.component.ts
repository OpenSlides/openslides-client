import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ViewPoll } from '../../../../pages/polls';
import { PollVoteComponent } from '../poll-vote/poll-vote.component';

@Component({
    selector: 'os-poll-approval-vote',
    imports: [PollVoteComponent],
    templateUrl: './poll-approval-vote.component.html',
    styleUrl: './poll-approval-vote.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollApprovalVoteComponent {
    public poll = input.required<ViewPoll>();
}
