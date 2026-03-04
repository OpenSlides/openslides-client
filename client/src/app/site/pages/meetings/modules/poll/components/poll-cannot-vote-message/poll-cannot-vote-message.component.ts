import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, input } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { combineLatest, distinctUntilChanged } from 'rxjs';
import { OperatorService } from 'src/app/site/services/operator.service';

import { BaseMeetingComponent } from '../../../../base/base-meeting.component';
import { ViewPoll } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';
import { VotingService } from '../../services/voting.service';

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

    public constructor(private cd: ChangeDetectorRef) {
        super();
        this.subscriptions.push(
            combineLatest([
                this.meetingSettingsService.get(`users_enable_vote_delegations`).pipe(distinctUntilChanged()),
                this.meetingSettingsService.get(`users_forbid_delegator_to_vote`).pipe(distinctUntilChanged())
            ]).subscribe(_ => {
                this.cd.markForCheck();
            })
        );
    }

    public hasVoted = rxResource({
        params: () => ({ poll: this.poll(), user: this.user() }),
        stream: ({ params }) => this.votingService.hasVoted(params.poll, params.user)
    });

    public getVotingError(user: ViewUser = this.actingUser()): string {
        return this.votingService.getVotingProhibitionReasonVerbose(this.poll(), user) || ``;
    }

    public getVotingErrorFromName(errorName: string): string {
        return this.votingService.getVotingProhibitionReasonVerboseFromName(errorName) || ``;
    }
}
