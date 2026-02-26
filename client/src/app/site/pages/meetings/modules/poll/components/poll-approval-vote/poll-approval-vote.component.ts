import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PollVoteComponent } from '../poll-vote/poll-vote.component';

@Component({
    selector: 'os-poll-approval-vote',
    imports: [PollVoteComponent],
    templateUrl: './poll-approval-vote.component.html',
    styleUrl: './poll-approval-vote.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollApprovalVoteComponent {}
