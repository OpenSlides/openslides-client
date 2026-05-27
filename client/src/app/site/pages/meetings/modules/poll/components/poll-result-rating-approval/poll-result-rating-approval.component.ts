import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { RatingApprovalPollResult, ViewPollConfigRatingApproval } from '../../../../pages/polls';
import { PollResultBaseComponent } from '../poll-result-base.component';
import { PollVoteOptionComponent } from '../poll-vote-option/poll-vote-option.component';

@Component({
    selector: 'os-poll-result-rating-approval',
    imports: [PollVoteOptionComponent, TranslatePipe],
    templateUrl: './poll-result-rating-approval.component.html',
    styleUrl: './poll-result-rating-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultRatingApprovalComponent extends PollResultBaseComponent<
    ViewPollConfigRatingApproval,
    RatingApprovalPollResult
> {}
