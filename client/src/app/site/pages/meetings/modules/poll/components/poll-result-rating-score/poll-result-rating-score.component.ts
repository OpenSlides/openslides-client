import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ViewPoll } from '../../../../pages/polls';

interface ResultsRaw {
    [key: number]: string;
    abstain?: string;
    invalid?: number;
}

@Component({
    selector: 'os-poll-result-rating-score',
    imports: [],
    templateUrl: './poll-result-rating-score.component.html',
    styleUrl: './poll-result-rating-score.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultRatingScoreComponent {
    public poll = input.required<ViewPoll>();

    public results = computed<ResultsRaw>(() => {
        if (!this.poll().result) {
            return [];
        }

        return JSON.parse(this.poll().result) || [];
    });
}
