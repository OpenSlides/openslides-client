import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ViewPoll } from '../../../../pages/polls';

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
    imports: [],
    templateUrl: './poll-result-rating-approval.component.html',
    styleUrl: './poll-result-rating-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultRatingApprovalComponent {
    public poll = input.required<ViewPoll>();

    public results = computed<ResultsRaw>(() => {
        if (!this.poll().result) {
            return [];
        }

        return JSON.parse(this.poll().result) || [];
    });
}
