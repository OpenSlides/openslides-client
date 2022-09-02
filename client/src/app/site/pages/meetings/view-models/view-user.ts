import { CML } from 'src/app/domain/definitions/organization-permission';
import { User } from 'src/app/domain/models/users/user';

import { Id } from '../../../../domain/definitions/key-types';
import { Projectiondefault } from '../../../../domain/models/projector/projection-default';
import { ViewCommittee } from '../../organization/pages/committees';
import { ViewSpeaker } from '../pages/agenda';
import { ViewAssignmentCandidate } from '../pages/assignments';
import { ViewChatMessage } from '../pages/chat/view-models/view-chat-message';
import { ViewMotion, ViewMotionSubmitter } from '../pages/motions';
import { ViewPersonalNote } from '../pages/motions/modules/personal-notes/view-models/view-personal-note';
import { ViewGroup } from '../pages/participants/modules/groups/view-models/view-group';
import { ViewOption, ViewPoll, ViewVote } from '../pages/polls';
import { BaseProjectableViewModel } from './base-projectable-model';
import { DelegationType } from './delegation-type';
import { ViewMeeting } from './view-meeting';

/**
 * Form control names that are editable for all users even if they have no permissions to manage users.
 */
export const PERSONAL_FORM_CONTROLS = [`username`, `email`, `about_me`, `pronoun`];

export class ViewUser extends BaseProjectableViewModel<User> /* implements Searchable */ {
    public static COLLECTION = User.COLLECTION;

    public get user(): User {
        return this._model;
    }

    public get isLastEmailSend(): boolean {
        return !!this.user.last_email_send;
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
        if (this.user.isVoteRightDelegated) {
            return DelegationType.Transferred;
        } else if (this.hasVoteRightFromOthers()) {
            return DelegationType.Received;
        }
        return DelegationType.Neither;
    }

    public get meeting_ids(): Id[] {
        return this.user.meeting_ids || [];
    }

    // Will be set by the repository
    public getName!: () => string;
    public getShortName!: () => string;
    public getFullName!: () => string;
    public getLevelAndNumber!: () => string;

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

    public get hasMultipleMeetings(): boolean {
        return this.meeting_ids?.length !== 1; // In case of `0` it should not return `true`
    }

    public get onlyMeeting(): Id {
        const meetingAmount = this.meeting_ids?.length || 0;
        if (meetingAmount === 1) {
            return this.meeting_ids[0];
        } else if (meetingAmount > 1) {
            throw new Error(`User has multiple meetings`);
        } else if (meetingAmount === 0) {
            throw new Error(`User has no meetings at all`);
        } else {
            throw new Error(`Cannot identify meetings`);
        }
    }

    public hasVoteRightFromOthers(meetingId?: Id): boolean {
        return this.vote_delegations_from_ids(meetingId || this.getEnsuredActiveMeetingId())?.length > 0;
    }

    public delegationName(meetingId?: Id): string | undefined {
        return this.vote_delegated_to(meetingId || this.getEnsuredActiveMeetingId())?.getFullName();
    }

    // ### In this block there is access to structured fields with the active meeting id as a default.
    public group_ids(meetingId?: Id): Id[] {
        return this.user.group_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public speaker_ids(meetingId?: Id): Id[] {
        return this.user.speaker_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public personal_note_ids(meetingId?: Id): Id[] {
        return this.user.personal_note_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public supported_motion_ids(meetingId?: Id): Id[] {
        return this.user.supported_motion_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public submitted_motion_ids(meetingId?: Id): Id[] {
        return this.user.submitted_motion_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public motion_poll_voted_ids(meetingId?: Id): Id[] {
        return this.user.motion_poll_voted_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public motion_vote_ids(meetingId?: Id): Id[] {
        return this.user.motion_vote_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public motion_delegated_vote_ids(meetingId?: Id): Id[] {
        return this.user.motion_vote_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public assignment_candidate_ids(meetingId?: Id): Id[] {
        return this.user.assignment_candidate_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public chat_message_ids(meetingId?: Id): Id[] {
        return this.user.chat_message_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public assignment_poll_voted_ids(meetingId?: Id): Id[] {
        return this.user.assignment_poll_voted_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public assignment_option_ids(meetingId?: Id): Id[] {
        return this.user.assignment_option_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public assignment_vote_ids(meetingId?: Id): Id[] {
        return this.user.assignment_vote_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public assignment_delegated_vote_ids(meetingId?: Id): Id[] {
        return this.user.assignment_delegated_vote_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public vote_delegated_to_id(meetingId?: Id): Id {
        return this.user.vote_delegated_to_id(meetingId || this.getEnsuredActiveMeetingId());
    }

    public vote_delegations_from_ids(meetingId?: Id): Id[] {
        return this.user.vote_delegations_from_ids(meetingId || this.getEnsuredActiveMeetingId());
    }

    public vote_weight(meetingId?: Id): number {
        return this.user.vote_weight(meetingId || this.getEnsuredActiveMeetingId());
    }

    public number(meetingId?: Id): string {
        try {
            return this.user.number(meetingId || this.getEnsuredActiveMeetingId());
        } catch (e) {
            return this.user.default_number;
        }
    }

    public structure_level(meeting_id?: Id): string {
        try {
            return this.user.structure_level(meeting_id || this.getEnsuredActiveMeetingId());
        } catch (e) {
            return this.user.default_structure_level;
        }
    }

    public comment(meetingId?: Id): string {
        return this.user.comment(meetingId || this.getEnsuredActiveMeetingId());
    }

    public about_me(meetingId?: Id): string {
        return this.user.about_me(meetingId || this.getEnsuredActiveMeetingId());
    }

    public get isVoteWeightOne(): boolean {
        return this.default_vote_weight === 1;
    }

    public get isVoteRightDelegated(): boolean {
        return !!this.vote_delegated_to_id(this.getEnsuredActiveMeetingId());
    }

    public get isVoteCountable(): boolean {
        const delegate = this.vote_delegated_to(this.getEnsuredActiveMeetingId());
        if (!delegate) {
            return this.isPresentInMeeting();
        }
        return delegate.isPresentInMeeting();
    }
    // ### block end.

    public override getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/users/${this.id}`;
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.user;
    }

    public canVoteFor(user: ViewUser | null): boolean {
        if (!user) {
            return false;
        }
        return this.vote_delegations_from_ids().includes(user.id);
    }
}
type UserManyStructuredRelation<Result> = (arg?: Id) => Result[];
interface IUserRelations {
    is_present_in_meetings: ViewMeeting[];
    committees: ViewCommittee[];
    meetings: ViewMeeting[];
    committee_management_levels: (arg?: CML) => ViewCommittee[];
    groups: UserManyStructuredRelation<ViewGroup>;
    speakers: UserManyStructuredRelation<ViewSpeaker>;
    personal_notes: UserManyStructuredRelation<ViewPersonalNote>;
    supported_motions: UserManyStructuredRelation<ViewMotion>;
    submitted_motions: UserManyStructuredRelation<ViewMotionSubmitter>;
    assignment_candidates: UserManyStructuredRelation<ViewAssignmentCandidate>;
    chat_messages: UserManyStructuredRelation<ViewChatMessage>;
    poll_voted: UserManyStructuredRelation<ViewPoll>;
    options: UserManyStructuredRelation<ViewOption>;
    votes: UserManyStructuredRelation<ViewVote>;
    vote_delegated_to: (arg?: Id) => ViewUser;
    vote_delegations_from: UserManyStructuredRelation<ViewUser>;
}
export interface ViewUser extends User, IUserRelations {}
