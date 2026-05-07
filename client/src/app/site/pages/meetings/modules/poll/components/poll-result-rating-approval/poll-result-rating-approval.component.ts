import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: 'os-poll-result-rating-approval',
    imports: [],
    templateUrl: './poll-result-rating-approval.component.html',
    styleUrl: './poll-result-rating-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultRatingApprovalComponent {
    public poll = input.required<ViewPoll>();
}
