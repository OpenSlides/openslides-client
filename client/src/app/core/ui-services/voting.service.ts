import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { PollState, PollType } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewUser } from 'app/site/users/models/view-user';

import { OperatorService } from '../core-services/operator.service';

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
    providedIn: `root`
})
export class VotingService {
    private currentUser?: ViewUser;

    public constructor(private operator: OperatorService) {
        this.operator.userObservable.subscribe(user => (this.currentUser = user));
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
    public getVotePermissionError(poll: ViewPoll, user: ViewUser = this.currentUser): VotingError | void {
        if (poll.hasVoted) {
            return VotingError.USER_HAS_VOTED;
        }
        if (this.operator.isAnonymous) {
            return VotingError.USER_IS_ANONYMOUS;
        }
        if (!this.operator.isInGroupIdsNonAdminCheck(...(poll.entitled_group_ids || []))) {
            return VotingError.USER_HAS_NO_PERMISSION;
        }
        if (poll.type === PollType.Analog) {
            return VotingError.POLL_WRONG_TYPE;
        }
        if (poll.state !== PollState.Started) {
            return VotingError.POLL_WRONG_STATE;
        }
        if (!user.isPresentInMeeting() && !this.currentUser.canVoteFor(user)) {
            return VotingError.USER_NOT_PRESENT;
        }
        if (user.isVoteRightDelegated && this.currentUser.id === user.id) {
            return VotingError.USER_HAS_DELEGATED_RIGHT;
        }
    }

    public getVotePermissionErrorVerbose(poll: ViewPoll, user: ViewUser = this.currentUser): string | void {
        const error = this.getVotePermissionError(poll, user);
        if (error) {
            return VotingErrorVerbose[error];
        }
    }
}
