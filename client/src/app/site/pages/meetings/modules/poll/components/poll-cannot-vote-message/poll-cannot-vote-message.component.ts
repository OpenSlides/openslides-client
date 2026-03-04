import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { OperatorService } from 'src/app/site/services/operator.service';

import { BaseMeetingComponent } from '../../../../base/base-meeting.component';
import { ViewPoll } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';
import { VotingProhibition, VotingService } from '../../services/voting.service';

@Component({
    selector: `os-poll-cannot-vote-message`,
    templateUrl: `./poll-cannot-vote-message.component.html`,
    styleUrls: [`./poll-cannot-vote-message.component.scss`],
    imports: [TranslatePipe, MatIconModule, MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollCannotVoteMessageComponent extends BaseMeetingComponent {
    public poll = input.required<ViewPoll>();
    public user = input.required<ViewUser>();

    public reason = input<VotingProhibition>();

    public isDeliveringVote = input(false);
    public hasDelegations = input(false);

    public hasAlreadyVoted = computed(() => {
        return this.hasVoted.hasValue() && this.hasVoted.value();
    });

    public get isUserPresent(): boolean {
        return this.actingUser().isPresentInMeeting();
    }

    private operator = inject(OperatorService);
    private votingService = inject(VotingService);

    private actingUser = toSignal(this.operator.userObservable);

    public constructor() {
        super();
    }

    public hasVoted = rxResource({
        params: () => ({ poll: this.poll(), user: this.user() }),
        stream: ({ params }) => this.votingService.hasVoted(params.poll, params.user)
    });

    public getVotingErrorFromName(errorName: VotingProhibition): string {
        return this.votingService.getVotingProhibitionReasonVerboseFromName(errorName) || ``;
    }
}
