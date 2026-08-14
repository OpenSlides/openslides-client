import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ViewPollConfigRatingScore } from '../../../../pages/polls/view-models/poll-config-rating-score';
import { RatingScorePollResult } from '../../../../pages/polls/view-models/poll-result-rating-score';
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
