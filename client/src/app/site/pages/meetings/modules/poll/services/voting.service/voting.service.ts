import { inject, Injectable } from '@angular/core';
import { PollState } from '@app/domain/models/poll/poll-constants';
import { PollRepositoryService } from '@app/gateways/repositories/polls/poll-repository.service';
import { ViewPoll, ViewPollBallot } from '@app/site/pages/meetings/pages/polls';
import { ViewUser } from '@app/site/pages/meetings/view-models/view-user';
import { OperatorService } from '@app/site/services/operator.service';
import { UserControllerService } from '@app/site/services/user-controller.service';
import { _ } from '@ngx-translate/core';
import { combineLatest, map, Observable } from 'rxjs';

import { ActiveMeetingService } from '../../../../services/active-meeting.service';
import { MeetingSettingsService } from '../../../../services/meeting-settings.service';
import { ViewMeetingUser } from '../../../../view-models/view-meeting-user';

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
    providedIn: 'root'
})
export class VotingService {
    private _currentUser: ViewUser | null = null;
    private _voteDelegationEnabled = false;
    private _forbidDelegationToVote = false;

    private userRepo = inject(UserControllerService);
    private pollRepo = inject(PollRepositoryService);

    public constructor(
        private activeMeetingService: ActiveMeetingService,
        private operator: OperatorService,
        private meetingSettingsService: MeetingSettingsService
    ) {
        this.operator.userObservable.subscribe(user => (this._currentUser = user));
        this.meetingSettingsService
            .get(`users_enable_vote_delegations`)
            .subscribe(enabled => (this._voteDelegationEnabled = enabled));
        this.meetingSettingsService
            .get(`users_forbid_delegator_to_vote`)
            .subscribe(enabled => (this._forbidDelegationToVote = enabled));
    }

    /**
     * checks whether the operator can vote on the given poll
     */
    public hasVotedObservable(poll: ViewPoll, user?: ViewMeetingUser): Observable<boolean> {
        if (!user) {
            user = this.operator.user.getMeetingUser();
        }

        return this.pollRepo.pollBallotsByUser(poll.id, user.id).pipe(map(ballots => !!ballots.length));
    }

    /**
     * checks whether the operator can vote on the given poll
     */
    public votingProhibited(poll: ViewPoll, user?: ViewUser): Observable<VotingProhibition | null> {
        // TODO: [potatojuicemachine::10.07.2026] user being undefined will throw here. Not sure what the correct fix would be.
        return combineLatest([
            this.userRepo.getViewModelObservable(user.id),
            this.pollRepo.getViewModelObservable(poll.id),
            this.pollRepo.pollBallotsByUser(poll.id, user.id)
        ]).pipe(
            map(([user, poll, ballots]) => {
                return this.getVotingProhibitionReason(poll, user, ballots);
            })
        );
    }

    private getVotingProhibitionReason(
        poll: ViewPoll,
        user: ViewUser,
        ballots: ViewPollBallot[]
    ): VotingProhibition | null {
        if (this.operator.isAnonymous) {
            return VotingProhibition.USER_IS_ANONYMOUS;
        }

        if (ballots.find(b => b.represented_meeting_user_id === user.getMeetingUser().id) !== undefined) {
            return VotingProhibition.USER_HAS_VOTED;
        }

        if (this._currentUser?.id === user?.id) {
            if (user?.isVoteRightDelegated && this._voteDelegationEnabled && this._forbidDelegationToVote) {
                return VotingProhibition.USER_HAS_DELEGATED_RIGHT;
            }
        }

        if (
            !(poll.entitled_group_ids || []).some(id =>
                user.group_ids(this.activeMeetingService.meetingId).includes(id)
            )
        ) {
            return VotingProhibition.USER_HAS_NO_PERMISSION;
        }

        if (poll.isAnalog) {
            return VotingProhibition.POLL_WRONG_TYPE;
        }

        if (poll.state !== PollState.Started) {
            return VotingProhibition.POLL_WRONG_STATE;
        }

        if (!user?.isPresentInMeeting() && !this._currentUser?.canVoteFor(user)) {
            return VotingProhibition.USER_NOT_PRESENT;
        }

        return null;
    }

    /**
     * checks whether the operator can vote on the given poll
     */
    public canVote(poll: ViewPoll, user?: ViewUser): boolean {
        const error = this.getVotingProhibitionReasonLegacy(poll, user);
        return !error;
    }

    /**
     * checks whether the operator can vote on the given poll
     * @returns null if no errors exist (= user can vote) or else a VotingProhibition reason
     */
    private getVotingProhibitionReasonLegacy(
        poll: ViewPoll,
        user: ViewUser | null = this._currentUser
    ): VotingProhibition | void {
        if (this._currentUser?.id === user?.id) {
            if (user?.isVoteRightDelegated && this._voteDelegationEnabled && this._forbidDelegationToVote) {
                return VotingProhibition.USER_HAS_DELEGATED_RIGHT;
            }
        }

        if (this._currentUser?.id !== user?.id) {
            if (poll.ballots.find(b => b.represented_meeting_user_id === user.getMeetingUser().id) !== undefined) {
                return VotingProhibition.USER_HAS_VOTED;
            }
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
        if (poll.isAnalog) {
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
        const reason = this.getVotingProhibitionReasonLegacy(poll, user);
        if (reason) {
            return VotingProhibitionVerbose[reason];
        }
    }

    public getVotingProhibitionReasonVerboseFromName(reason: VotingProhibition): string {
        return VotingProhibitionVerbose[reason] ?? _(`There is an unknown voting problem.`);
    }
}
