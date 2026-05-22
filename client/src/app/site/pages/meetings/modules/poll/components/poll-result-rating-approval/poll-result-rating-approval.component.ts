import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { ViewPollConfigRatingApproval } from '../../../../pages/polls';
import { PollResultBaseComponent } from '../poll-result-base.component';
import { PollVoteOptionComponent } from '../poll-vote-option/poll-vote-option.component';

interface ResultsRaw {
    [key: number]: {
        yes?: string;
        no?: string;
        abstain?: string;
    };
    abstain?: string;
    invalid?: number;
}

@Component({
    selector: 'os-poll-result-rating-approval',
    imports: [PollVoteOptionComponent, TranslatePipe],
    templateUrl: './poll-result-rating-approval.component.html',
    styleUrl: './poll-result-rating-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultRatingApprovalComponent extends PollResultBaseComponent<
    ViewPollConfigRatingApproval,
    ResultsRaw
> {}
