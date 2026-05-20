import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ViewPoll } from '../../../../pages/polls';

@Component({
    selector: 'os-poll-result-rating-score',
    imports: [],
    templateUrl: './poll-result-rating-score.component.html',
    styleUrl: './poll-result-rating-score.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultRatingScoreComponent {
    public poll = input.required<ViewPoll>();
}
