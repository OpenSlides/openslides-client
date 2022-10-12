import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { PollState, PollType } from 'src/app/domain/models/poll/poll-constants';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ActiveMeetingService } from '../../../../services/active-meeting.service';
import { MeetingSettingsService } from '../../../../services/meeting-settings.service';
import { PollServiceModule } from '../poll-service.module';

export enum VotingError {
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
const VotingErrorVerbose = {
    [VotingError.POLL_WRONG_STATE]: _(`You can not vote right now because the voting has not yet started.`),
    [VotingError.POLL_WRONG_TYPE]: _(`You can not vote because this is an analog voting.`),
    [VotingError.USER_HAS_NO_PERMISSION]: _(`You do not have the permission to vote.`),
    [VotingError.USER_IS_ANONYMOUS]: _(`You have to be logged in to be able to vote.`),
    [VotingError.USER_NOT_PRESENT]: _(`You have to be present to vote.`),
    [VotingError.USER_HAS_DELEGATED_RIGHT]: _(`Your voting right was delegated to another person.`),
    [VotingError.USER_HAS_VOTED]: _(`You have already voted.`)
};

@Injectable({
    providedIn: PollServiceModule
})
export class VotingService {
    private _currentUser: ViewUser | null = null;
    private _voteDelegationEnabled: boolean = false;

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
        const error = this.getVotePermissionError(poll, user);
        return !error;
    }

    /**
     * checks whether the operator can vote on the given poll
     * @returns null if no errors exist (= user can vote) or else a VotingError
     */
    public getVotePermissionError(poll: ViewPoll, user: ViewUser | null = this._currentUser): VotingError | void {
        if (this._currentUser?.id === user?.id) {
            if (user?.isVoteRightDelegated && this._voteDelegationEnabled) {
                return VotingError.USER_HAS_DELEGATED_RIGHT;
            }
            if (poll.hasVoted) {
                return VotingError.USER_HAS_VOTED;
            }
        }
        if (this._currentUser?.id !== user?.id && poll.hasVotedForDelegations(user?.id)) {
            return VotingError.USER_HAS_VOTED;
        }
        if (this.operator.isAnonymous) {
            return VotingError.USER_IS_ANONYMOUS;
        }
        if (
            !(poll.entitled_group_ids || []).some(id =>
                user.group_ids(this.activeMeetingService.meetingId).includes(id)
            )
        ) {
            return VotingError.USER_HAS_NO_PERMISSION;
        }
        if (poll.type === PollType.Analog) {
            return VotingError.POLL_WRONG_TYPE;
        }
        if (poll.state !== PollState.Started) {
            return VotingError.POLL_WRONG_STATE;
        }
        if (!user?.isPresentInMeeting() && !this._currentUser?.canVoteFor(user)) {
            return VotingError.USER_NOT_PRESENT;
        }
    }

    public getVotePermissionErrorVerbose(poll: ViewPoll, user: ViewUser | null = this._currentUser): string | void {
        const error = this.getVotePermissionError(poll, user);
        if (error) {
            return VotingErrorVerbose[error];
        }
    }

    public getVotePermissionErrorVerboseFromName(errorName: string) {
        return VotingErrorVerbose[VotingError[errorName]] ?? _(`There is an unknown voting problem.`);
    }
}
