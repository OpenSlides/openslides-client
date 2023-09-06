import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { PollState, PollType } from 'src/app/domain/models/poll/poll-constants';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ActiveMeetingService } from '../../../../services/active-meeting.service';
import { MeetingSettingsService } from '../../../../services/meeting-settings.service';
import { PollServiceModule } from '../poll-service.module';

export enum VotingProhibition {
    POLL_WRONG_STATE = 1, // 1 so we can check with negation
    POLL_WRONG_TYPE,
    USER_HAS_NO_PERMISSION,
    USER_IS_ANONYMOUS,
    USER_NOT_PRESENT,
    USER_HAS_DELEGATED_RIGHT,
    USER_HAS_VOTED
}

/**
 * TODO: It appears that the only message that makes sense for the user to see it the last one.
 */
const VotingProhibitionVerbose = {
    [VotingProhibition.POLL_WRONG_STATE]: _(`You can not vote right now because the voting has not yet started.`),
    [VotingProhibition.POLL_WRONG_TYPE]: _(`You can not vote because this is an analog voting.`),
    [VotingProhibition.USER_HAS_NO_PERMISSION]: _(`You do not have the permission to vote.`),
    [VotingProhibition.USER_IS_ANONYMOUS]: _(`You have to be logged in to be able to vote.`),
    [VotingProhibition.USER_NOT_PRESENT]: _(`You have to be present to vote.`),
    [VotingProhibition.USER_HAS_DELEGATED_RIGHT]: _(`Your voting right was delegated to another person.`),
    [VotingProhibition.USER_HAS_VOTED]: _(`You have already voted.`)
};

@Injectable({
    providedIn: PollServiceModule
})
export class VotingService {
    private _currentUser: ViewUser | null = null;
    private _voteDelegationEnabled = false;

    public constructor(
        private activeMeetingService: ActiveMeetingService,
        private operator: OperatorService,
        private meetingSettingsService: MeetingSettingsService
    ) {
        this.operator.userObservable.subscribe(user => (this._currentUser = user));
        this.meetingSettingsService
            .get(`users_enable_vote_delegations`)
            .subscribe(enabled => (this._voteDelegationEnabled = enabled));
    }

    /**
     * checks whether the operator can vote on the given poll
     */
    public canVote(poll: ViewPoll, user?: ViewUser): boolean {
        const error = this.getVotingProhibitionReason(poll, user);
        return !error;
    }

    /**
     * checks whether the operator can vote on the given poll
     * @returns null if no errors exist (= user can vote) or else a VotingProhibition reason
     */
    private getVotingProhibitionReason(
        poll: ViewPoll,
        user: ViewUser | null = this._currentUser
    ): VotingProhibition | void {
        if (this._currentUser?.id === user?.id) {
            if (user?.isVoteRightDelegated && this._voteDelegationEnabled) {
                return VotingProhibition.USER_HAS_DELEGATED_RIGHT;
            }
            if (poll.hasVoted) {
                return VotingProhibition.USER_HAS_VOTED;
            }
        }
        if (this._currentUser?.id !== user?.id && poll.hasVotedForDelegations(user?.id)) {
            return VotingProhibition.USER_HAS_VOTED;
        }
        if (this.operator.isAnonymous) {
            return VotingProhibition.USER_IS_ANONYMOUS;
        }
        if (
            !(poll.entitled_group_ids || []).some(id =>
                user.group_ids(this.activeMeetingService.meetingId).includes(id)
            )
        ) {
            return VotingProhibition.USER_HAS_NO_PERMISSION;
        }
        if (poll.type === PollType.Analog) {
            return VotingProhibition.POLL_WRONG_TYPE;
        }
        if (poll.state !== PollState.Started) {
            return VotingProhibition.POLL_WRONG_STATE;
        }
        if (!user?.isPresentInMeeting() && !this._currentUser?.canVoteFor(user)) {
            return VotingProhibition.USER_NOT_PRESENT;
        }
    }

    public getVotingProhibitionReasonVerbose(poll: ViewPoll, user: ViewUser | null = this._currentUser): string | void {
        const reason = this.getVotingProhibitionReason(poll, user);
        if (reason) {
            return VotingProhibitionVerbose[reason];
        }
    }

    public getVotingProhibitionReasonVerboseFromName(reasonName: string) {
        return VotingProhibitionVerbose[VotingProhibition[reasonName]] ?? _(`There is an unknown voting problem.`);
    }
}
