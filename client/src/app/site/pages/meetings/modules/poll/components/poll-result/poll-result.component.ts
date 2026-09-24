import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';

import { PollResultApprovalComponent } from '../poll-result-approval/poll-result-approval.component';
import { PollResultRatingApprovalComponent } from '../poll-result-rating-approval/poll-result-rating-approval.component';
import { PollResultRatingScoreComponent } from '../poll-result-rating-score/poll-result-rating-score.component';
import { PollResultSelectionComponent } from '../poll-result-selection/poll-result-selection.component';

@Component({
    selector: 'os-poll-result',
    imports: [
        PollResultApprovalComponent,
        PollResultSelectionComponent,
        PollResultRatingApprovalComponent,
        PollResultRatingScoreComponent
    ],
    templateUrl: './poll-result.component.html',
    styleUrl: './poll-result.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultComponent {
    public poll = input.required<ViewPoll>();

    public config = rxResource<any, ViewPoll>({
        params: () => this.poll(),
        stream: ({ params }) => params.config$
    });

    public configType = computed(() => {
        return this.poll().config?.method ?? `none`;
    });
}
