import { HasProjectorTitle } from '@app/domain/interfaces/has-projector-title';
import { HasProperties } from '@app/domain/interfaces/has-properties';
import { FONT_PLACES, FontPlace, LOGO_PLACES, LogoPlace } from '@app/domain/models/mediafiles/mediafile.constants';
import { Meeting } from '@app/domain/models/meetings/meeting';
import {
    ViewMeetingDefaultProjectorsKey,
    ViewMeetingMediafileUsageKey
} from '@app/domain/models/meetings/meeting.constants';
import { MeetingPollSetting } from '@app/domain/models/meetings/meeting-poll-setting';
import { ProjectiondefaultValue } from '@app/domain/models/projector/projection-default';
import { ViewHistoryEntry } from '@app/gateways/repositories/history-entry/view-history-entry';
import { ViewModelRelations } from '@app/site/base/base-view-model';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { endOfDay, fromUnixTime, startOfDay } from 'date-fns';

import { ViewCommittee } from '../../organization/pages/committees/view-models/view-committee';
import { HasOrganizationTags } from '../../organization/pages/organization-tags/view-models/has-organization-tags';
import { ViewOrganization } from '../../organization/view-models/view-organization';
import { BaseHasMeetingUsersViewModel } from '../base/base-has-meeting-user-view-model';
import { ViewListOfSpeakers } from '../pages/agenda/modules/list-of-speakers/view-models/view-list-of-speakers';
import { ViewPointOfOrderCategory } from '../pages/agenda/modules/list-of-speakers/view-models/view-point-of-order-category';
import { ViewSpeaker } from '../pages/agenda/modules/list-of-speakers/view-models/view-speaker';
import { ViewTopic } from '../pages/agenda/modules/topics/view-models/view-topic';
import { ViewAgendaItem } from '../pages/agenda/view-models/view-agenda-item';
import { ViewAssignment } from '../pages/assignments/view-models/view-assignment';
import { ViewAssignmentCandidate } from '../pages/assignments/view-models/view-assignment-candidate';
import { ViewChatGroup } from '../pages/chat/view-models/view-chat-group';
import { ViewChatMessage } from '../pages/chat/view-models/view-chat-message';
import { ViewMediafile } from '../pages/mediafiles/view-models/view-mediafile';
import { ViewMeetingMediafile } from '../pages/mediafiles/view-models/view-meeting-mediafile';
import { ViewMotionCategory } from '../pages/motions/modules/categories/view-models/view-motion-category';
import { ViewMotionChangeRecommendation } from '../pages/motions/modules/change-recommendations/view-models/view-motion-change-recommendation';
import { ViewMotionComment } from '../pages/motions/modules/comments/view-models/view-motion-comment';
import { ViewMotionCommentSection } from '../pages/motions/modules/comments/view-models/view-motion-comment-section';
import { ViewMotionEditor } from '../pages/motions/modules/editors/view-models/view-motion-editor';
import { ViewMotionBlock } from '../pages/motions/modules/motion-blocks/view-models/view-motion-block';
import { ViewPersonalNote } from '../pages/motions/modules/personal-notes/view-models/view-personal-note';
import { ViewMotionState } from '../pages/motions/modules/states/view-models/view-motion-state';
import { ViewMotionSubmitter } from '../pages/motions/modules/submitters/view-models/view-motion-submitter';
import { ViewMotionSupporter } from '../pages/motions/modules/supporters/view-models/view-motion-supporter';
import { ViewTag } from '../pages/motions/modules/tags/view-models/view-tag';
import { ViewMotionWorkflow } from '../pages/motions/modules/workflows/view-models/view-motion-workflow';
import { ViewMotionWorkingGroupSpeaker } from '../pages/motions/modules/working-group-speakers/view-models/view-motion-working-group-speaker';
import { ViewMotion } from '../pages/motions/view-models/view-motion';
import { ViewGroup } from '../pages/participants/modules/groups/view-models/view-group';
import { ViewStructureLevel } from '../pages/participants/pages/structure-levels/view-models/view-structure-level';
import { ViewPollBallot } from '../pages/polls/view-models/poll-ballot';
import { ViewProjection } from '../pages/projectors/view-models/view-projection';
import { ViewProjector } from '../pages/projectors/view-models/view-projector';
import { ViewProjectorCountdown } from '../pages/projectors/view-models/view-projector-countdown';
import { ViewProjectorMessage } from '../pages/projectors/view-models/view-projector-message';
import { ViewMeetingPollSetting } from './view-meeting-poll-setting';
import { ViewUser } from './view-user';

export const MEETING_LIST_SUBSCRIPTION = `meeting_list`;
export const MEETING_CREATE_SUBSCRIPTION = `meeting_create`;

export enum RelatedTime {
    Future = 1,
    Current,
    Past,
    Dateless
}

export class ViewMeeting extends BaseHasMeetingUsersViewModel<Meeting> {
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

    public get motionsAmount(): number {
        return this.motion_ids?.length || 0;
    }

    public get committeeName(): string {
        return this.committee?.name;
    }

    public get isArchived(): boolean {
        return !this.is_active_in_organization_id;
    }

    public get isActive(): boolean {
        return !!this.is_active_in_organization_id;
    }

    public get isTemplate(): boolean {
        return !!this.template_for_organization_id;
    }

    // Poll defaults aliases
    public get topic_poll_setting_enable_cumulative_voting(): MeetingPollSetting[`enable_cumulative_voting`] {
        return this.topic_poll_config.enable_cumulative_voting;
    }

    public get topic_poll_setting_allow_live_voting(): MeetingPollSetting[`allow_live_voting`] {
        return this.topic_poll_config.allow_live_voting;
    }

    public get topic_poll_setting_visibility(): MeetingPollSetting[`visibility`] {
        return this.topic_poll_config.visibility;
    }

    public get topic_poll_setting_method(): MeetingPollSetting[`method`] {
        return this.topic_poll_config.method;
    }

    public get topic_poll_setting_group_ids(): MeetingPollSetting[`group_ids`] {
        return this.topic_poll_config.group_ids;
    }

    public get topic_poll_setting_enable_max_yes_votes(): MeetingPollSetting[`enable_max_yes_votes`] {
        return this.topic_poll_config.enable_max_yes_votes;
    }

    public get topic_poll_setting_enable_max_options_limit(): MeetingPollSetting[`enable_max_options_limit`] {
        return this.topic_poll_config.enable_max_options_limit;
    }

    public get topic_poll_setting_enable_live_voting(): MeetingPollSetting[`enable_live_voting`] {
        return this.topic_poll_config.enable_live_voting;
    }

    public get topic_poll_setting_required_majority(): MeetingPollSetting[`required_majority`] {
        return this.topic_poll_config.required_majority;
    }

    public get topic_poll_setting_onehundred_percent_base(): MeetingPollSetting[`onehundred_percent_base`] {
        return this.topic_poll_config.onehundred_percent_base;
    }

    public get topic_poll_setting_sort_result_by_votes(): MeetingPollSetting[`sort_result_by_votes`] {
        return this.topic_poll_config.sort_result_by_votes;
    }

    public get motion_poll_setting_visibility(): MeetingPollSetting[`visibility`] {
        return this.motion_poll_config.visibility;
    }

    public get motion_poll_setting_group_ids(): MeetingPollSetting[`group_ids`] {
        return this.motion_poll_config.group_ids;
    }

    public get motion_poll_setting_method(): MeetingPollSetting[`method`] {
        return this.motion_poll_config.method;
    }

    public get motion_poll_setting_allow_live_voting(): MeetingPollSetting[`allow_live_voting`] {
        return this.motion_poll_config.allow_live_voting;
    }

    public get motion_poll_setting_enable_live_voting(): MeetingPollSetting[`enable_live_voting`] {
        return this.motion_poll_config.enable_live_voting;
    }

    public get motion_poll_setting_required_majority(): MeetingPollSetting[`required_majority`] {
        return this.motion_poll_config.required_majority;
    }

    public get motion_poll_setting_onehundred_percent_base(): MeetingPollSetting[`onehundred_percent_base`] {
        return this.motion_poll_config.onehundred_percent_base;
    }

    public get assignment_poll_setting_visibility(): MeetingPollSetting[`visibility`] {
        return this.assignment_poll_config.visibility;
    }

    public get assignment_poll_setting_group_ids(): MeetingPollSetting[`group_ids`] {
        return this.assignment_poll_config.group_ids;
    }

    public get assignment_poll_setting_method(): MeetingPollSetting[`method`] {
        return this.assignment_poll_config.method;
    }

    public get assignment_poll_setting_enable_max_yes_votes(): MeetingPollSetting[`enable_max_yes_votes`] {
        return this.assignment_poll_config.enable_max_yes_votes;
    }

    public get assignment_poll_setting_enable_cumulative_voting(): MeetingPollSetting[`enable_cumulative_voting`] {
        return this.assignment_poll_config.enable_cumulative_voting;
    }

    public get assignment_poll_setting_enable_max_options_limit(): MeetingPollSetting[`enable_max_options_limit`] {
        return this.assignment_poll_config.enable_max_options_limit;
    }

    public get assignment_poll_setting_allow_live_voting(): MeetingPollSetting[`allow_live_voting`] {
        return this.assignment_poll_config.allow_live_voting;
    }

    public get assignment_poll_setting_enable_live_voting(): MeetingPollSetting[`enable_live_voting`] {
        return this.assignment_poll_config.enable_live_voting;
    }

    public get assignment_poll_setting_required_majority(): MeetingPollSetting[`required_majority`] {
        return this.assignment_poll_config.required_majority;
    }

    public get assignment_poll_setting_onehundred_percent_base(): MeetingPollSetting[`onehundred_percent_base`] {
        return this.assignment_poll_config.onehundred_percent_base;
    }

    public get assignment_poll_setting_sort_result_by_votes(): MeetingPollSetting[`sort_result_by_votes`] {
        return this.assignment_poll_config.sort_result_by_votes;
    }

    public get relatedTime(): RelatedTime {
        const referenceTime = this.start_time ?? this.end_time;
        if (!referenceTime && referenceTime !== 0) {
            return RelatedTime.Dateless;
        }
        const current = new Date();
        const start = startOfDay(fromUnixTime(this.start_time)) ?? startOfDay(fromUnixTime(this.end_time));
        const end = endOfDay(fromUnixTime(this.end_time)) ?? endOfDay(fromUnixTime(this.start_time));
        if (current < start) {
            return RelatedTime.Future;
        } else if (current <= end) {
            return RelatedTime.Current;
        } else {
            return RelatedTime.Past;
        }
    }

    public static COLLECTION = Meeting.COLLECTION;

    protected _collection = Meeting.COLLECTION;

    public publicAccessPossible!: () => boolean;

    public getUrl(): string {
        return `/${this.id}/`;
    }

    public override canAccess(): boolean {
        return this[Meeting.ACCESSIBILITY_FIELD] !== undefined && this[Meeting.ACCESSIBILITY_FIELD] !== null;
    }

    public getSpecifiedLogoPlaces(): LogoPlace[] {
        return LOGO_PLACES.filter(place => !!this.logo_id(place));
    }

    public getSpecifiedFontPlaces(): FontPlace[] {
        return FONT_PLACES.filter(place => !!this.font_id(place));
    }

    public getSpecifiedPlaces(): (LogoPlace | FontPlace)[] {
        return [...this.getSpecifiedLogoPlaces(), ...this.getSpecifiedFontPlaces()];
    }

    public default_projectors(place: ProjectiondefaultValue): ViewProjector[] {
        return this[`default_projectors_${place}`];
    }

    public canBeEnteredBy(user: ViewUser): boolean {
        return !this.locked_from_inside || user.group_ids(this.id).length > 0;
    }

    public getStatus(): string[] {
        const status: string[] = [
            this.isArchived ? `isArchived` : `isNotArchived`,
            this.enable_anonymous ? `isAnonymous` : `isNotAnonymous`,
            this.isTemplate ? `isTemplate` : `isNotTemplate`
        ];
        if (this.locked_from_inside) {
            status.push(`isLockedFromInside`);
        }
        return status;
    }

    public canEditMeetingSetting(user: ViewUser): boolean {
        return user.getMeetingUser(this.id)?.group_ids.includes(this.meeting.admin_group_id);
    }
}
interface IMeetingRelations {
    motions_default_workflow: ViewMotionWorkflow;
    motions_default_amendment_workflow: ViewMotionWorkflow;
    motion_poll_default_groups: ViewGroup[];
    assignment_poll_default_groups: ViewGroup[];
    topic_poll_default_groups: ViewGroup[];
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
    meeting_mediafiles: ViewMeetingMediafile[];
    motions: ViewMotion[];
    motion_comment_sections: ViewMotionCommentSection[];
    motion_comments: ViewMotionComment[];
    motion_categories: ViewMotionCategory[];
    motion_blocks: ViewMotionBlock[];
    motion_submitters: ViewMotionSubmitter[];
    motion_supporters: ViewMotionSupporter[];
    motion_editors: ViewMotionEditor[];
    motion_working_group_speakers: ViewMotionWorkingGroupSpeaker[];
    motion_change_recommendations: ViewMotionChangeRecommendation[];
    motion_workflows: ViewMotionWorkflow[];
    motion_states: ViewMotionState[];
    forwarded_motions: ViewMotion[];
    polls: ViewPoll[];
    votes: ViewPollBallot[];
    assignments: ViewAssignment[];
    assignment_candidates: ViewAssignmentCandidate[];
    chat_groups: ViewChatGroup[];
    chat_messages: ViewChatMessage[];
    committee: ViewCommittee;
    template_meeting_for_committee?: ViewCommittee;
    default_meeting_for_committee?: ViewCommittee;
    present_users: ViewUser[];
    reference_projector: ViewProjector;
    projections: ViewProjection[];
    default_group: ViewGroup;
    anonymous_group: ViewGroup;
    admin_group: ViewGroup;
    is_active_in_organization: ViewOrganization;
    is_archived_in_organization: ViewOrganization;
    template_for_organization: ViewOrganization;
    poll_countdown: ViewProjectorCountdown;
    list_of_speakers_countdown: ViewProjectorCountdown;
    point_of_order_categories: ViewPointOfOrderCategory[];
    structure_levels: ViewStructureLevel[];
    relevant_history_entries: ViewHistoryEntry[];
    assignment_poll_config: ViewMeetingPollSetting;
    motion_poll_config: ViewMeetingPollSetting;
    topic_poll_config: ViewMeetingPollSetting;
}
export interface ViewMeeting
    extends
        Meeting,
        ViewModelRelations<IMeetingRelations>,
        HasProjectorTitle,
        HasOrganizationTags,
        HasProperties<ViewMeetingMediafileUsageKey, ViewMediafile>,
        HasProperties<ViewMeetingDefaultProjectorsKey, ViewProjector[]> {}
