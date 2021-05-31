import { StructuredRelation } from 'app/core/definitions/relations';
import { Meeting } from 'app/shared/models/event-management/meeting';
import { ViewOption } from 'app/shared/models/poll/view-option';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewVote } from 'app/shared/models/poll/view-vote';
import { ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { ViewAssignmentCandidate } from 'app/site/assignments/models/view-assignment-candidate';
import { BaseViewModel } from 'app/site/base/base-view-model';
import { HasProjectorTitle } from 'app/site/base/projectable';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionBlock } from 'app/site/motions/models/view-motion-block';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { ViewMotionChangeRecommendation } from 'app/site/motions/models/view-motion-change-recommendation';
import { ViewMotionComment } from 'app/site/motions/models/view-motion-comment';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { ViewMotionStatuteParagraph } from 'app/site/motions/models/view-motion-statute-paragraph';
import { ViewMotionSubmitter } from 'app/site/motions/models/view-motion-submitter';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';
import { ViewProjection } from 'app/site/projector/models/view-projection';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { ViewProjectorCountdown } from 'app/site/projector/models/view-projector-countdown';
import { ViewProjectorMessage } from 'app/site/projector/models/view-projector-message';
import { ViewTag } from 'app/site/tags/models/view-tag';
import { ViewTopic } from 'app/site/topics/models/view-topic';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewPersonalNote } from 'app/site/users/models/view-personal-note';
import { ViewUser } from 'app/site/users/models/view-user';
import { ViewCommittee } from './view-committee';
import { ViewOrganisationTag } from './view-organisation-tag';

export interface HasMeeting {
    meeting: ViewMeeting;
}

export class ViewMeeting extends BaseViewModel<Meeting> {
    public get meeting(): Meeting {
        return this._model;
    }

    public get startDate(): Date | undefined {
        return this.start_time ? new Date(this.start_time * 1000) : undefined;
    }

    public get endDate(): Date | undefined {
        return this.end_time ? new Date(this.end_time * 1000) : undefined;
    }

    public get userAmount(): number {
        return this.user_ids?.length || 0;
    }
    public static COLLECTION = Meeting.COLLECTION;

    public static ACCESSIBILITY_FIELD: keyof Meeting = 'description';
    protected _collection = Meeting.COLLECTION;

    public getUrl(): string {
        return `/${this.id}/`;
    }

    public canAccess(): boolean {
        return this[ViewMeeting.ACCESSIBILITY_FIELD] !== undefined && this[ViewMeeting.ACCESSIBILITY_FIELD] !== null;
    }
}
interface IMeetingRelations {
    motions_default_workflow: ViewMotionWorkflow;
    motions_default_amendment_workflow: ViewMotionWorkflow;
    motions_default_statute_amendment_workflow: ViewMotionWorkflow;
    motion_poll_default_groups: ViewGroup[];
    assignment_poll_default_groups: ViewGroup[];
    poll_default_groups: ViewGroup[];
    projectors: ViewProjector[];
    all_projections: ViewProjection[];
    projector_messages: ViewProjectorMessage[];
    projector_countdowns: ViewProjectorCountdown[];
    tags: ViewTag[];
    agenda_items: ViewAgendaItem[];
    lists_of_speakers: ViewListOfSpeakers[];
    speakers: ViewSpeaker[];
    topics: ViewTopic[];
    groups: ViewGroup[];
    personal_notes: ViewPersonalNote[];
    mediafiles: ViewMediafile[];
    motions: ViewMotion[];
    motion_comment_sections: ViewMotionCommentSection[];
    motion_comments: ViewMotionComment[];
    motion_categories: ViewMotionCategory[];
    motion_blocks: ViewMotionBlock[];
    motion_submitters: ViewMotionSubmitter[];
    motion_change_recommendations: ViewMotionChangeRecommendation[];
    motion_workflows: ViewMotionWorkflow[];
    motion_states: ViewMotionState[];
    motion_statute_paragraphs: ViewMotionStatuteParagraph[];
    polls: ViewPoll[];
    options: ViewOption[];
    votes: ViewVote[];
    assignments: ViewAssignment[];
    assignment_candidates: ViewAssignmentCandidate[];
    logo: StructuredRelation<string, ViewMediafile | null>;
    font: StructuredRelation<string, ViewMediafile | null>;
    committee: ViewCommittee;
    template_meeting_for_committee?: ViewCommittee;
    default_meeting_for_committee?: ViewCommittee;
    present_users: ViewUser[];
    temporary_users: ViewUser[];
    guests: ViewUser[];
    users: ViewUser[];
    reference_projector: ViewProjector;
    default_projector: StructuredRelation<string, ViewProjector | null>;
    projections: ViewProjection[];
    default_group: ViewGroup;
    admin_group: ViewGroup;
    organisation_tags: ViewOrganisationTag[];
}
export interface ViewMeeting extends Meeting, IMeetingRelations, HasProjectorTitle {}
