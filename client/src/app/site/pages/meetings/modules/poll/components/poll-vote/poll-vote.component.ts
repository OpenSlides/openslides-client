import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ViewPoll } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';

@Component({
    selector: 'os-poll-vote',
    imports: [],
    templateUrl: './poll-vote.component.html',
    styleUrl: './poll-vote.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteComponent {
    public poll = input.required<ViewPoll>();
    public user = input.required<ViewUser>();

    // TODO: Display vote form depending on selected config
}
