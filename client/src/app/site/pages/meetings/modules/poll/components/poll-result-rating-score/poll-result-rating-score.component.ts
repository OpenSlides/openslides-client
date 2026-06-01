import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RatingScorePollResult, ViewPollConfigRatingScore } from '../../../../pages/polls';
import { PollResultBaseComponent } from '../poll-result-base.component';
import { PollResultSelectionComponent } from '../poll-result-selection/poll-result-selection.component';

@Component({
    selector: 'os-poll-result-rating-score',
    imports: [PollResultSelectionComponent],
    templateUrl: './poll-result-rating-score.component.html',
    styleUrl: './poll-result-rating-score.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultRatingScoreComponent extends PollResultBaseComponent<
    ViewPollConfigRatingScore,
    RatingScorePollResult
> {}
