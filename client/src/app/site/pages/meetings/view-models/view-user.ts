import { User } from 'src/app/domain/models/users/user';
import { HasHistoryEntries } from 'src/app/gateways/repositories/history-entry/has-history-entries';
import { ViewHistoryPosition } from 'src/app/gateways/repositories/history-position/view-history-position';
import { BaseViewModel, ViewModelRelations } from 'src/app/site/base/base-view-model';

import { Id } from '../../../../domain/definitions/key-types';
import { ViewGender } from '../../organization/pages/accounts/pages/gender/view-models/view-gender';
import { ViewCommittee } from '../../organization/pages/committees';
import { ViewOrganization } from '../../organization/view-models/view-organization';
import { ViewGroup } from '../pages/participants/modules/groups/view-models/view-group';
import { ViewStructureLevel } from '../pages/participants/pages/structure-levels/view-models';
import { ViewBallot, ViewOption, ViewPoll } from '../pages/polls';
import { ViewPollCandidate } from '../pages/polls/view-models/view-poll-candidate';
import { DelegationType } from './delegation-type';
import { ViewMeeting } from './view-meeting';
import { ViewMeetingUser } from './view-meeting-user';

export enum DuplicateStatus {
    None,
    SameEmail,
    SameName,
    All
}

/**
 * Form control names that are editable for all users even if they have no permissions to manage users.
 */
export const PERSONAL_FORM_CONTROLS = [`username`, `email`, `about_me`, `pronoun`];

export class ViewUser extends BaseViewModel<User> /* implements Searchable */ {
    public static COLLECTION = User.COLLECTION;

    public get user(): User {
        return this._model;
    }

    public get isLastEmailSent(): boolean {
        return !!this.last_email_sent;
    }

    public get isLastLogin(): boolean {
        return !!this.last_login;
    }

    public get hasEmail(): boolean {
        return !!this.email;
    }

    public get isCommitteeManager(): boolean {
        return !!this.committee_managements.length;
    }

    public get numberOfMeetings(): number {
        return this.meetings.length;
    }

    public get name(): string {
        if (this.user && this.getName) {
            return this.getName();
        } else {
            return ``;
        }
    }

    public get short_name(): string {
        if (this.user && this.getShortName) {
            return this.getShortName();
        } else {
            return ``;
        }
    }

    public get full_name(): string {
        if (this.user && this.getFullName) {
            return this.getFullName();
        } else {
            return ``;
        }
    }

    public get delegationType(): DelegationType {
        if (this.isVoteRightDelegated) {
            return DelegationType.Transferred;
        } else if (this.hasVoteRightFromOthers()) {
            return DelegationType.Received;
        }
        return DelegationType.Neither;
    }

    public get meeting_ids(): Id[] {
        return this.user.meeting_ids || [];
    }

    public get isInActiveMeeting(): boolean {
        return this.meetings.some(meeting => meeting.isActive);
    }

    public get isInArchivedMeeting(): boolean {
        return this.meetings.some(meeting => meeting.isArchived);
    }

    public get hasSamlId(): boolean {
        return this.saml_id !== null && this.saml_id !== undefined;
    }

    public get is_present(): boolean {
        return this.isPresentInMeeting();
    }

    public get is_locked_out(): boolean {
        return this.isLockedOutOfMeeting();
    }

    public get hasMemberNumber(): boolean {
        return !!this.member_number;
    }

    public get hasHomeCommittee(): boolean {
        return !!this.home_committee_id;
    }

    public get gender_name(): string {
        return this.gender?.name ?? ``;
    }

    public get homeCommitteeName(): string {
        return this.home_committee?.name ?? ``;
    }

    public get externalString(): string {
        return this.external ? this.getTranslatedExternal() : ``;
    }

    // Will be set by the repository
    public getName!: () => string;
    public getShortName!: () => string;
    public getFullName!: (structureLevel?: ViewStructureLevel) => string;
    public getLevelAndNumber!: () => string;
    public getMeetingUser!: (meetingId?: Id) => ViewMeetingUser;
    public getTranslatedExternal!: () => string;

    /**
     * A function which will return the id of the currently active meeting, if one is chosen.
     *
     * @returns The id of the currently active meeting
     */
    public getEnsuredActiveMeetingId!: () => Id;

    /**
     * @param meetingId The meeting id. If not provided, tha active meeting id is used.
     * If there is no active meeting, an error will be thrown.
     * @returns if the user is present in the given meeting
     */
    public isPresentInMeeting(meetingId?: Id): boolean {
        if (!meetingId) {
            meetingId = this.getEnsuredActiveMeetingId();
        }
        return this.is_present_in_meeting_ids?.includes(meetingId) || false;
    }

    /**
     * @param meetingId The meeting id. If not provided, tha active meeting id is used.
     * If there is no active meeting, an error will be thrown.
     * @returns if the user is locked out of the given meeting
     */
    public isLockedOutOfMeeting(meetingId?: Id): boolean {
        return this.getMeetingUser(meetingId || this.getEnsuredActiveMeetingId())?.locked_out || false;
    }

    public get hasMultipleMeetings(): boolean {
        if (this.meeting_users?.length) {
            return this.meeting_users.filter(mu => !mu.locked_out).length !== 1;
        }

        return this.meeting_ids?.length !== 1; // In case of `0` it should not return `true`
    }

    public get onlyMeeting(): Id {
        let meetingIds = this.meeting_ids || [];
        if (this.meeting_users?.length) {
            meetingIds = this.ensuredMeetingIds;
        }

        const meetingAmount = meetingIds.length;
        if (meetingAmount === 1) {
            return meetingIds[0];
        } else if (meetingAmount > 1) {
            throw new Error(`User has multiple meetings`);
        } else if (meetingAmount === 0) {
            throw new Error(`User has no meetings at all`);
        } else {
            throw new Error(`Cannot identify meetings`);
        }
    }

    /**
     * Returns all meetings that the user actually has group memberships for.
     */
    public get ensuredMeetingIds(): number[] {
        return (
            this.meeting_users
                .filter(mUser => mUser.group_ids?.length && !mUser.locked_out)
                .map(mUser => mUser.meeting_id) || []
        );
    }

    public hasVoteRightFromOthers(meetingId?: Id): boolean {
        return this.vote_delegations_from_ids(meetingId || this.getEnsuredActiveMeetingId())?.length > 0;
    }

    public delegationName(meetingId?: Id): string | undefined {
        return this.vote_delegated_to(meetingId || this.getEnsuredActiveMeetingId())?.getFullName();
    }

    public speaker_ids(meetingId?: Id): Id[] {
        return this.getMeetingUser(meetingId)?.speaker_ids;
    }

    public personal_note_ids(meetingId?: Id): Id[] {
        return this.getMeetingUser(meetingId)?.personal_note_ids;
    }

    public supported_motion_ids(meetingId?: Id): Id[] {
        return this.getMeetingUser(meetingId)?.motion_supporters?.map(sup => sup.motion_id);
    }

    public submitted_motion_ids(meetingId?: Id): Id[] {
        return this.getMeetingUser(meetingId)?.submitted_motion_ids;
    }

    public assignment_candidate_ids(meetingId?: Id): Id[] {
        return this.getMeetingUser(meetingId)?.assignment_candidate_ids;
    }

    public chat_message_ids(meetingId?: Id): Id[] {
        return this.getMeetingUser(meetingId)?.chat_message_ids;
    }

    public vote_delegated_to_id(meetingId?: Id): Id {
        return this.getMeetingUser(meetingId)?.vote_delegated_to?.user_id;
    }

    public vote_delegated_to_meeting_user_id(meetingId?: Id): Id {
        return this.getMeetingUser(meetingId)?.vote_delegated_to_id;
    }

    public vote_delegations_from_ids(meetingId?: Id): Id[] {
        return this.getMeetingUser(meetingId)?.vote_delegations_from?.map(meeting_user => meeting_user?.user_id);
    }

    public vote_delegations_from_meeting_user_ids(meetingId?: Id): Id[] {
        return this.getMeetingUser(meetingId)?.vote_delegations_from_ids;
    }

    public vote_weight(meetingId?: Id): number {
        return this.getMeetingUser(meetingId)?.vote_weight ?? this.default_vote_weight;
    }

    public number(meetingId?: Id): string {
        try {
            return this.getMeetingUser(meetingId)?.number;
        } catch (e) {
            return ``;
        }
    }

    public comment(meetingId?: Id): string {
        return this.getMeetingUser(meetingId)?.comment;
    }

    public about_me(meetingId?: Id): string {
        return this.getMeetingUser(meetingId)?.about_me;
    }

    public groups(meetingId?: Id): ViewGroup[] {
        return this.getMeetingUser(meetingId)?.groups ?? [];
    }

    public group_ids(meetingId?: Id): number[] {
        return this.getMeetingUser(meetingId)?.group_ids ?? [];
    }

    public structure_level_ids(meetingId?: Id): Id[] {
        return this.getMeetingUser(meetingId)?.structure_level_ids;
    }

    public structure_levels(meetingId?: Id): ViewStructureLevel[] {
        return (this.getMeetingUser(meetingId)?.structure_levels ?? []).sort((a, b) => a.name.localeCompare(b.name));
    }

    public structure_level(meetingId?: Id): string {
        return this.structure_levels(meetingId)
            .map(sl => sl.name)
            .join(`,`);
    }

    public structureLevels(meetingId?: Id): string {
        return this.getMeetingUser(meetingId)?.structureLevels();
    }

    public get isVoteWeightOne(): boolean {
        return (!this.getEnsuredActiveMeetingId() ? this.default_vote_weight : this.vote_weight()) === 1;
    }

    public get isVoteRightDelegated(): boolean {
        return !!this.vote_delegated_to_id(this.getEnsuredActiveMeetingId());
    }

    public get voteWeight(): number {
        return this.vote_weight() ?? this.default_vote_weight;
    }

    public get isVoteCountable(): boolean {
        const delegate = this.vote_delegated_to(this.getEnsuredActiveMeetingId());
        const present = this.isPresentInMeeting();
        if (this.isSelfVotingAllowedDespiteDelegation() && present) {
            return true;
        }
        if (this.getDelegationSettingEnabled() && delegate) {
            return delegate.isPresentInMeeting();
        }
        return present;
    }
    // ### block end.

    public canVoteForGroups(): Id[] {
        const delegate = this.vote_delegated_to(this.getEnsuredActiveMeetingId());
        const present = this.isPresentInMeeting();
        if (
            !(
                present &&
                (this.isSelfVotingAllowedDespiteDelegation() || !(this.getDelegationSettingEnabled() && delegate))
            )
        ) {
            return [];
        }
        return Array.from(
            new Set([
                ...this.group_ids(),
                ...(this.vote_delegations_from() ?? []).flatMap(delegation => delegation.group_ids())
            ])
        );
    }

    public override getDetailStateUrl(): string {
        if (this.getEnsuredActiveMeetingId && this.getEnsuredActiveMeetingId()) {
            return `/${this.getEnsuredActiveMeetingId()}/participants/${this.id}`;
        }

        return `/accounts/${this.id}`;
    }

    public canVoteFor(user: ViewUser | null): boolean {
        if (!user) {
            return false;
        }
        return this.vote_delegations_from_ids()?.includes(user.id);
    }

    public vote_delegated_to_meeting_user(meetingId?: number): ViewMeetingUser {
        return this.getMeetingUser(meetingId)?.vote_delegated_to;
    }

    public vote_delegated_to(meetingId?: number): ViewUser {
        return this.vote_delegated_to_meeting_user(meetingId)?.user;
    }

    public vote_delegations_from_meeting_users(meetingId?: number): ViewMeetingUser[] {
        return this.getMeetingUser(meetingId)?.vote_delegations_from;
    }

    public vote_delegations_from(meetingId?: number): ViewUser[] {
        return this.vote_delegations_from_meeting_users(meetingId)?.map(meeting_user => meeting_user.user) || [];
    }

    /**
     * Returns all votes given by the user in a given meeting.
     */
    public getAllVotes(meetingId?: number): ViewBallot[] {
        const meetingID = meetingId ?? this.getEnsuredActiveMeetingId();
        return this.votes
            .filter(vote => vote.meeting_id === meetingID)
            .concat(this.getMeetingUser(meetingId)?.vote_delegated_votes ?? []);
    }

    public getDuplicateStatusInMap(data: { name: Map<string, Id[]>; email: Map<string, Id[]> }): DuplicateStatus {
        const sameNameIds = this.getName() ? data.name.get(this.getName()) : [];
        const sameEmailIds = this.email ? data.email.get(this.email) : [];
        let status: number = DuplicateStatus.None;
        if (sameNameIds?.find(id => id !== this.id)) {
            status = DuplicateStatus.SameName;
        }
        if (sameEmailIds?.find(id => id !== this.id)) {
            status = status === DuplicateStatus.SameName ? DuplicateStatus.All : DuplicateStatus.SameEmail;
        }
        return status;
    }
}
interface IUserRelations {
    is_present_in_meetings: ViewMeeting[];
    committees: ViewCommittee[];
    home_committee: ViewCommittee;
    meetings: ViewMeeting[];
    organization: ViewOrganization;
    meeting_users: ViewMeetingUser[];
    poll_voted: ViewPoll[];
    committee_managements: ViewCommittee[];
    options: ViewOption[];
    votes: ViewBallot[];
    poll_candidates: ViewPollCandidate[];
    gender?: ViewGender;
    history_positions: ViewHistoryPosition[];
}

export interface ViewUser extends User, ViewModelRelations<IUserRelations>, HasHistoryEntries {}
