import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ViewPollOption } from '../../../../pages/polls';

@Component({
    selector: 'os-poll-vote-option',
    imports: [],
    templateUrl: './poll-vote-option.component.html',
    styleUrl: './poll-vote-option.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteOptionComponent {
    public option = input.required<ViewPollOption>();
}
