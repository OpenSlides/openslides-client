import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ViewPoll } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';

@Component({
    selector: 'os-poll-vote-selection',
    imports: [],
    templateUrl: './poll-vote-selection.component.html',
    styleUrl: './poll-vote-selection.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteSelectionComponent {
    public poll = input.required<ViewPoll>();
    public user = input.required<ViewUser>();
    public loading = input<boolean>(false);

    public voted = output<unknown>();
}
