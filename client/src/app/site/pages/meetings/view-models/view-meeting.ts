import { HasProjectorTitle } from 'src/app/domain/interfaces/has-projector-title';
import { FONT_PLACES, FontPlace, LOGO_PLACES,LogoPlace } from 'src/app/domain/models/mediafiles/mediafile.constants';
import { Meeting } from 'src/app/domain/models/meetings/meeting';
import { applyMixins } from 'src/app/infrastructure/utils';

import { StructuredRelation } from '../../../../infrastructure/definitions/relations';
import { BaseViewModel } from '../../../base/base-view-model';
import { ViewCommittee } from '../../organization/pages/committees';
import { HasOrganizationTags } from '../../organization/pages/organization-tags';
import { ViewOrganization } from '../../organization/view-models/view-organization';
import { ViewAgendaItem, ViewListOfSpeakers, ViewSpeaker, ViewTopic } from '../pages/agenda';
import { ViewAssignment, ViewAssignmentCandidate } from '../pages/assignments';
import { ViewChatGroup, ViewChatMessage } from '../pages/chat';
import { HasProperties, ViewMediafile } from '../pages/mediafiles';
import {
    ViewMotion,
    ViewMotionBlock,
    ViewMotionCategory,
    ViewMotionChangeRecommendation,
    ViewMotionComment,
    ViewMotionCommentSection,
    ViewMotionState,
    ViewMotionStatuteParagraph,
    ViewMotionSubmitter,
    ViewMotionWorkflow,
    ViewPersonalNote,
    ViewTag
} from '../pages/motions';
import { ViewGroup } from '../pages/participants';
import { ViewOption, ViewPoll, ViewVote } from '../pages/polls';
import { ViewProjection, ViewProjector, ViewProjectorCountdown, ViewProjectorMessage } from '../pages/projectors';
import { HasMeetingUsers } from './view-meeting-user';
import { ViewUser } from './view-user';

export const MEETING_LIST_SUBSCRIPTION = `meeting_list`;

export type ViewMeetingMediafileUsageKey = `logo_${LogoPlace}` | `font_${FontPlace}`;

export const VIEW_MEETING_MEDIAFILE_USAGE_ID_KEYS = [
    ...LOGO_PLACES.map(place => `logo_${place}` as ViewMeetingMediafileUsageKey),
    ...FONT_PLACES.map(place => `font_${place}` as ViewMeetingMediafileUsageKey)
];

interface HasFontsAndLogos extends HasProperties<ViewMeetingMediafileUsageKey, ViewMediafile> {}

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
        return this.meeting_user_ids?.length || 0;
    }

    public get isArchived(): boolean {
        return !this.is_active_in_organization_id;
    }

    public get isActive(): boolean {
        return !!this.is_active_in_organization_id;
    }

    public static COLLECTION = Meeting.COLLECTION;
    public static ACCESSIBILITY_FIELD: keyof Meeting = `description`;

    protected _collection = Meeting.COLLECTION;

    public getUrl(): string {
        return `/${this.id}/`;
    }

    public override canAccess(): boolean {
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
    forwarded_motions: ViewMotion[];
    polls: ViewPoll[];
    options: ViewOption[];
    votes: ViewVote[];
    assignments: ViewAssignment[];
    assignment_candidates: ViewAssignmentCandidate[];
    chat_groups: ViewChatGroup[];
    chat_messages: ViewChatMessage[];
    committee: ViewCommittee;
    template_meeting_for_committee?: ViewCommittee;
    default_meeting_for_committee?: ViewCommittee;
    present_users: ViewUser[];
    reference_projector: ViewProjector;
    default_projectors: StructuredRelation<string, ViewProjector[]>;
    projections: ViewProjection[];
    default_group: ViewGroup;
    admin_group: ViewGroup;
    is_active_in_organization: ViewOrganization;
    is_archived_in_organization: ViewOrganization;
    template_for_organization: ViewOrganization;
    poll_countdown: ViewProjectorCountdown;
    list_of_speakers_countdown: ViewProjectorCountdown;
}
export interface ViewMeeting
    extends Meeting,
        IMeetingRelations,
        HasProjectorTitle,
        HasOrganizationTags,
        HasMeetingUsers,
        HasFontsAndLogos {}
applyMixins(ViewMeeting, [HasMeetingUsers]);
