import { Id } from 'app/core/definitions/key-types';
import { SearchRepresentation } from 'app/core/ui-services/search.service';
import { MotionVote } from 'app/shared/models/motions/motion-vote';
import { User } from 'app/shared/models/users/user';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { ViewAssignmentCandidate } from 'app/site/assignments/models/view-assignment-candidate';
import { ViewAssignmentOption } from 'app/site/assignments/models/view-assignment-option';
import { ViewAssignmentPoll } from 'app/site/assignments/models/view-assignment-poll';
import { ViewAssignmentVote } from 'app/site/assignments/models/view-assignment-vote';
import { BaseProjectableViewModel } from 'app/site/base/base-projectable-view-model';
import { ProjectorElementBuildDeskriptor } from 'app/site/base/projectable';
import { Searchable } from 'app/site/base/searchable';
import { ViewCommittee } from 'app/site/event-management/models/view-committee';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewRole } from 'app/site/event-management/models/view-role';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { ViewMotionSubmitter } from 'app/site/motions/models/view-motion-submitter';
import { ViewProjection } from 'app/site/projector/models/view-projection';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { ViewGroup } from './view-group';
import { ViewPersonalNote } from './view-personal-note';

export interface UserTitleInformation {
    username: string;
    title?: string;
    first_name?: string;
    last_name?: string;
    structure_level?: string;
    number?: string;
}

export enum DelegationType {
    Transferred = 1,
    Received,
    Neither
}

export class ViewUser extends BaseProjectableViewModel<User> implements UserTitleInformation, Searchable {
    public static COLLECTION = User.COLLECTION;

    public get user(): User {
        return this._model;
    }

    public get isSamlUser(): boolean {
        throw new Error('TODO');
        // return this.auth_type === 'saml';
    }

    public get isLastEmailSend(): boolean {
        return !!this.user.last_email_send;
    }

    public get short_name(): string {
        if (this.user && this.getShortName) {
            return this.getShortName();
        } else {
            return '';
        }
    }

    public get full_name(): string {
        if (this.user && this.getFullName) {
            return this.getFullName();
        } else {
            return '';
        }
    }

    public get delegationName(): string | undefined {
        return 'TODO';
        //return this.voteDelegatedTo?.getFullName();
    }

    public get delegationType(): DelegationType {
        if (this.user.isVoteRightDelegated) {
            return DelegationType.Transferred;
        } else if (this.user.hasVoteRightFromOthers) {
            return DelegationType.Received;
        }
        return DelegationType.Neither;
    }

    // Will be set by the repository
    public getFullName: () => string;
    public getShortName: () => string;
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
        return this.is_present_in_meeting_ids.includes(meetingId);
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

    public assignment_candidate_ids(meetingId?: Id): Id[] {
        return this.user.assignment_candidate_ids(meetingId || this.getEnsuredActiveMeetingId());
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
    // ### block end.

    /**
     * Formats the category for search
     *
     * @override
     */
    public formatForSearch(): SearchRepresentation {
        const properties = [
            { key: 'Title', value: this.getTitle() },
            { key: 'First name', value: this.first_name },
            { key: 'Last name', value: this.last_name },
            { key: 'Structure level', value: this.structure_level },
            { key: 'Number', value: this.number },
            { key: 'Vote Delegation', value: this.delegationName }
        ];
        return { properties, searchValue: properties.map(property => property.value) };
    }

    public getDetailStateURL(): string {
        return `/users/${this.id}`;
    }

    public getSlide(): ProjectorElementBuildDeskriptor {
        return {
            getBasicProjectorElement: options => ({
                name: User.COLLECTION,
                id: this.id,
                getNumbers: () => ['name', 'id']
            }),
            slideOptions: [],
            projectionDefaultName: 'users',
            getDialogTitle: () => this.getTitle()
        };
    }

    public canVoteFor(user: ViewUser): boolean {
        return this.vote_delegated_from_users_id.includes(user.id);
    }
}
type UserStructuredRelation<Result> = (arg?: Id) => Result[];
interface IUserRelations {
    role?: ViewRole;
    is_present_in_meetings: ViewMeeting[];
    meeting?: ViewMeeting;
    guest_meetings: ViewMeeting[];
    committees_as_member: ViewCommittee[];
    committees_as_manager: ViewCommittee[];
    projections: ViewProjection[];
    current_projectors: ViewProjector[];
    groups: UserStructuredRelation<ViewGroup>;
    speakers: UserStructuredRelation<ViewSpeaker>;
    personal_notes: UserStructuredRelation<ViewPersonalNote>;
    supported_motions: UserStructuredRelation<ViewMotion>;
    submitted_motions: UserStructuredRelation<ViewMotionSubmitter>;
    motion_poll_voted: UserStructuredRelation<ViewMotionPoll>;
    motion_votes: UserStructuredRelation<MotionVote>;
    assignment_candidates: UserStructuredRelation<ViewAssignmentCandidate>;
    assignment_poll_voted: UserStructuredRelation<ViewAssignmentPoll>;
    assignment_options: UserStructuredRelation<ViewAssignmentOption>;
    assignment_votes: UserStructuredRelation<ViewAssignmentVote>;
}
export interface ViewUser extends User, IUserRelations {}
