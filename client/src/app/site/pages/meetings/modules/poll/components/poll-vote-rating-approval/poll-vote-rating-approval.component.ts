import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ViewPoll } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';

@Component({
    selector: 'os-poll-vote-rating-approval',
    imports: [],
    templateUrl: './poll-vote-rating-approval.component.html',
    styleUrl: './poll-vote-rating-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteRatingApprovalComponent {
    public poll = input.required<ViewPoll>();
    public user = input.required<ViewUser>();
    public loading = input<boolean>(false);

    public voted = output<unknown>();
}
