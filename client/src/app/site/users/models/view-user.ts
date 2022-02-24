import { Id } from 'app/core/definitions/key-types';
import { SearchRepresentation } from 'app/core/ui-services/search.service';
import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ViewOption } from 'app/shared/models/poll/view-option';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewVote } from 'app/shared/models/poll/view-vote';
import { Projectiondefault } from 'app/shared/models/projector/projector';
import { User } from 'app/shared/models/users/user';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { ViewAssignmentCandidate } from 'app/site/assignments/models/view-assignment-candidate';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { Searchable } from 'app/site/base/searchable';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionSubmitter } from 'app/site/motions/models/view-motion-submitter';

import { ViewChatMessage } from '../../../shared/models/chat/chat-messages/view-chat-message';
import { ViewGroup } from './view-group';
import { ViewPersonalNote } from './view-personal-note';

export enum DelegationType {
    Transferred = 1,
    Received,
    Neither
}

export class ViewUser extends BaseProjectableViewModel<User> implements Searchable {
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
        return this.user.meeting_ids;
    }

    // Will be set by the repository
    public getName: () => string;
    public getShortName: () => string;
    public getFullName: () => string;
    public getLevelAndNumber: () => string;

    // Will be injected by the repository.
    public getEnsuredActiveMeetingId: () => Id;

    /**
     * @param The meeting id. If not provided, tha active meeting id is used.
     * If there is no active meeting, an error will be thrown.
     * @returns if the user is present in the given meeting
     */
    public isPresentInMeeting(meetingId?: Id): boolean {
        if (!meetingId) {
            meetingId = this.getEnsuredActiveMeetingId();
        }
        return this.is_present_in_meeting_ids?.includes(meetingId);
    }

    public get hasMultipleMeetings(): boolean {
        return this.meeting_ids.length !== 1;
    }

    public get onlyMeeting(): Id {
        const meetingAmount = this.meeting_ids?.length || 0;
        if (meetingAmount === 1) {
            return this.meeting_ids[0];
        } else if (meetingAmount > 1) {
            throw new Error(`User has multiple meetings`);
        } else if (meetingAmount === 0) {
            throw new Error(`User has no meetings at all`);
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
        return this.user.number(meetingId || this.getEnsuredActiveMeetingId());
    }

    public structure_level(meeting_id?: Id): string {
        return this ? this.user.structure_level(meeting_id || this.getEnsuredActiveMeetingId()) : ``;
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

    /**
     * Formats the category for search
     *
     * @override
     */
    public formatForSearch(): SearchRepresentation {
        const properties = [
            { key: `Title`, value: this.getTitle() },
            { key: `First name`, value: this.first_name },
            { key: `Last name`, value: this.last_name },
            { key: `Structure level`, value: this.structure_level() },
            { key: `Number`, value: this.number() },
            { key: `Delegation of vote`, value: this.delegationName() }
        ];
        return { properties, searchValue: properties.map(property => property.value) };
    }

    public getDetailStateUrl(): string {
        return `/${this.getActiveMeetingId()}/users/${this.id}`;
    }

    public getProjectiondefault(): Projectiondefault {
        return Projectiondefault.user;
    }

    public canVoteFor(user: ViewUser): boolean {
        return this.vote_delegations_from_ids().includes(user.id);
    }
}
type UserManyStructuredRelation<Result> = (arg?: Id) => Result[];
interface IUserRelations {
    is_present_in_meetings: ViewMeeting[];
    committees: ViewCommittee[];
    // committee_management_levels: (cml: CML) => ViewCommittee[]; // Not working yet!
    meetings: ViewMeeting[];
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
