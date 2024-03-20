import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { debounceTime } from 'rxjs';
import { OperatorService } from 'src/app/site/services/operator.service';

import { BaseMeetingComponent } from '../../../../base/base-meeting.component';
import { ViewPoll } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';
import { VotingService } from '../../services/voting.service';

@Component({
    selector: `os-poll-cannot-vote-message`,
    templateUrl: `./poll-cannot-vote-message.component.html`,
    styleUrls: [`./poll-cannot-vote-message.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollCannotVoteMessageComponent extends BaseMeetingComponent {
    @Input()
    public delegationUser: ViewUser;

    @Input()
    public hasAlreadyVoted: boolean;

    @Input()
    public isDeliveringVote = false;

    @Input()
    public hasDelegations = false;

    @Input()
    public poll: ViewPoll;

    public user: ViewUser;

    public get isUserPresent(): boolean {
        return this.user?.isPresentInMeeting();
    }

    public constructor(operator: OperatorService, private votingService: VotingService, private cd: ChangeDetectorRef) {
        super();
        this.subscriptions.push(
            operator.userObservable.pipe(debounceTime(50)).subscribe(user => {
                if (user) {
                    this.user = user;
                }
                this.cd.markForCheck();
            })
        );
    }

    public getVotingError(user: ViewUser = this.user): string {
        return this.votingService.getVotingProhibitionReasonVerbose(this.poll, user) || ``;
    }

    public getVotingErrorFromName(errorName: string) {
        return this.votingService.getVotingProhibitionReasonVerboseFromName(errorName) || ``;
    }
}
