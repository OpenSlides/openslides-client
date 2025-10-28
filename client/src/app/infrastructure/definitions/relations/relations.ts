import {
    FONT_PLACES,
    LOGO_PLACES,
    ViewMediafileMeetingUsageKey
} from 'src/app/domain/models/mediafiles/mediafile.constants';
import {
    MeetingDefaultProjectorIdsKey,
    ViewMeetingDefaultProjectorsKey,
    ViewMeetingMediafileUsageKey
} from 'src/app/domain/models/meetings/meeting.constants';
import { PROJECTIONDEFAULTS } from 'src/app/domain/models/projector/projection-default';
import { ViewProjectorMeetingUsageKey } from 'src/app/domain/models/projector/projector.constants';
import { ViewHistoryEntry } from 'src/app/gateways/repositories/history-entry/view-history-entry';
import { ViewHistoryPosition } from 'src/app/gateways/repositories/history-position/view-history-position';
import { ViewPointOfOrderCategory } from 'src/app/site/pages/meetings/pages/agenda/modules/list-of-speakers/view-models/view-point-of-order-category';
import { ViewMeetingMediafile } from 'src/app/site/pages/meetings/pages/mediafiles/view-models/view-meeting-mediafile';
import { ViewMotionEditor } from 'src/app/site/pages/meetings/pages/motions/modules/editors';
import { ViewMotionWorkingGroupSpeaker } from 'src/app/site/pages/meetings/pages/motions/modules/working-group-speakers';
import {
    ViewStructureLevel,
    ViewStructureLevelListOfSpeakers
} from 'src/app/site/pages/meetings/pages/participants/pages/structure-levels/view-models';
import { ViewPollCandidate } from 'src/app/site/pages/meetings/pages/polls/view-models/view-poll-candidate';
import { ViewPollCandidateList } from 'src/app/site/pages/meetings/pages/polls/view-models/view-poll-candidate-list';
import { ViewMeetingUser } from 'src/app/site/pages/meetings/view-models/view-meeting-user';
import { ViewGender } from 'src/app/site/pages/organization/pages/accounts/pages/gender/view-models/view-gender';
import { ViewResource } from 'src/app/site/pages/organization/pages/resources';

import { BaseViewModel, ViewModelConstructor } from '../../../site/base/base-view-model';
import {
    HasAgendaItem,
    HasListOfSpeakers,
    ViewAgendaItem,
    ViewListOfSpeakers,
    ViewSpeaker,
    ViewTopic
} from '../../../site/pages/meetings/pages/agenda';
import { ViewAssignment, ViewAssignmentCandidate } from '../../../site/pages/meetings/pages/assignments';
import { ViewChatGroup, ViewChatMessage } from '../../../site/pages/meetings/pages/chat';
import { HasAttachmentMeetingMediafiles, ViewMediafile } from '../../../site/pages/meetings/pages/mediafiles';
import {
    HasReferencedMotionsInExtension,
    HasTags,
    ViewMotion,
    ViewMotionBlock,
    ViewMotionCategory,
    ViewMotionChangeRecommendation,
    ViewMotionComment,
    ViewMotionCommentSection,
    ViewMotionState,
    ViewMotionSubmitter,
    ViewMotionWorkflow,
    ViewPersonalNote,
    ViewTag
} from '../../../site/pages/meetings/pages/motions';
import { ViewGroup } from '../../../site/pages/meetings/pages/participants';
import { ViewOption, ViewPoll, ViewVote } from '../../../site/pages/meetings/pages/polls';
import {
    ViewProjection,
    ViewProjector,
    ViewProjectorCountdown,
    ViewProjectorMessage
} from '../../../site/pages/meetings/pages/projectors';
import { Projectable } from '../../../site/pages/meetings/view-models/projectable';
import { ViewMeeting } from '../../../site/pages/meetings/view-models/view-meeting';
import { ViewUser } from '../../../site/pages/meetings/view-models/view-user';
import { ViewCommittee } from '../../../site/pages/organization/pages/committees';
import { ViewTheme } from '../../../site/pages/organization/pages/designs';
import { HasOrganizationTags, ViewOrganizationTag } from '../../../site/pages/organization/pages/organization-tags';
import { ViewOrganization } from '../../../site/pages/organization/view-models/view-organization';
import {
    makeGenericM2M,
    makeGenericO2M,
    makeGenericO2O,
    makeM2M,
    makeM2O,
    makeManyDynamicallyNamedM2O,
    makeManyDynamicallyNamedO2O,
    makeO2O,
    Relation
} from './utils';

const PROJECTABLE_VIEW_MODELS: ViewModelConstructor<BaseViewModel & Projectable>[] = [
    ViewMotion,
    ViewMeetingMediafile,
    ViewListOfSpeakers,
    ViewMotionBlock,
    ViewAssignment,
    ViewAgendaItem,
    ViewPoll,
    ViewProjectorMessage,
    ViewProjectorCountdown
];

// Where to place relations (in this order):
// 2) For generic relations, the relation is defined on the generic side
// 3) Relations should assigned to the "higher" part of the relation. E.g.:
//     - The meeting<->committee relation is in the committee block.
//     - The motion<->category relation in in the motion block

export const RELATIONS: Relation[] = [
    // ########## Organization
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewCommittee,
        OField: `committees`,
        MField: `organization`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewUser,
        OField: `users`,
        MField: `organization`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewResource,
        OField: `resources`,
        MField: `organization`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewOrganizationTag,
        OField: `organization_tags`,
        MField: `organization`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewMediafile,
        OField: `mediafiles`,
        MField: `organization`,
        isExclusiveList: true
    }),
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewMeeting,
        OField: `active_meetings`,
        MField: `is_active_in_organization`,
        isExclusiveList: true
    }),
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewMeeting,
        OField: `archived_meetings`,
        MField: `is_archived_in_organization`,
        isExclusiveList: true
    }),
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewMeeting,
        OField: `template_meetings`,
        MField: `template_for_organization`
    }),
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewTheme,
        OField: `themes`,
        MField: `organization`,
        isFullList: true
    }),
    ...makeO2O({
        AViewModel: ViewOrganization,
        BViewModel: ViewTheme,
        AField: `theme`,
        BField: `theme_for_organization`
    }),
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewGender,
        OField: `genders`,
        MField: `organization`,
        isFullList: true
    }),
    // ########## Organization tags
    ...makeGenericM2M<ViewOrganizationTag, HasOrganizationTags>({
        viewModel: ViewOrganizationTag,
        possibleViewModels: [ViewCommittee, ViewMeeting],
        possibleViewModelsField: `organization_tags`,
        viewModelField: `tagged`,
        viewModelIdField: `tagged_ids`
    }),
    // ########## User
    ...makeM2M({
        AViewModel: ViewUser,
        BViewModel: ViewPoll,
        AField: `poll_voted`,
        AIdField: `poll_voted_ids`,
        BField: `voted`,
        BIdField: `voted_ids`
    }),
    ...makeM2O({
        OViewModel: ViewUser,
        MViewModel: ViewVote,
        OField: `votes`,
        MField: `user`
    }),
    ...makeM2O({
        OViewModel: ViewMeetingUser,
        MViewModel: ViewVote,
        OField: `vote_delegated_votes`,
        MField: `delegated_user`
    }),
    ...makeM2M({
        AViewModel: ViewUser,
        BViewModel: ViewCommittee,
        AField: `committee_managements`,
        BField: `managers`
    }),
    ...makeM2M({
        AViewModel: ViewGroup,
        BViewModel: ViewMeetingUser,
        AField: `meeting_users`,
        BField: `groups`
    }),
    ...makeM2O({
        OViewModel: ViewUser,
        MViewModel: ViewMeetingUser,
        OField: `meeting_users`,
        MField: `user`
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMeetingUser,
        OField: `meeting_users`,
        MField: `meeting`
    }),
    ...makeM2O({
        MViewModel: ViewAssignmentCandidate,
        OViewModel: ViewMeetingUser,
        MField: `meeting_user`,
        OField: `assignment_candidates`
    }),
    ...makeM2O({
        MViewModel: ViewChatMessage,
        OViewModel: ViewMeetingUser,
        MField: `meeting_user`,
        OField: `chat_messages`
    }),
    ...makeM2O({
        MViewModel: ViewSpeaker,
        OViewModel: ViewMeetingUser,
        MField: `meeting_user`,
        OField: `speakers`
    }),
    ...makeM2O({
        MViewModel: ViewPersonalNote,
        OViewModel: ViewMeetingUser,
        MField: `meeting_user`,
        OField: `personal_notes`
    }),
    ...makeM2M({
        AViewModel: ViewMotion,
        BViewModel: ViewMeetingUser,
        AField: `supporter_meeting_users`,
        BField: `supported_motions`
    }),
    ...makeM2O({
        MViewModel: ViewMotionSubmitter,
        OViewModel: ViewMeetingUser,
        MField: `meeting_user`,
        OField: `submitted_motions`
    }),
    ...makeM2O({
        MViewModel: ViewMotionEditor,
        OViewModel: ViewMeetingUser,
        MField: `meeting_user`,
        OField: `motion_editors`
    }),
    ...makeM2O({
        MViewModel: ViewMotionWorkingGroupSpeaker,
        OViewModel: ViewMeetingUser,
        MField: `meeting_user`,
        OField: `motion_working_group_speakers`
    }),
    ...makeM2M({
        AViewModel: ViewStructureLevel,
        BViewModel: ViewMeetingUser,
        AField: `meeting_users`,
        BField: `structure_levels`
    }),
    ...makeM2O({
        MViewModel: ViewUser,
        OViewModel: ViewGender,
        MField: `gender`,
        OField: `users`
    }),
    ...makeM2O({
        MViewModel: ViewUser,
        OViewModel: ViewCommittee,
        MField: `home_committee`,
        OField: `users`
    }),
    // Vote delegations
    // vote_delegated_to_id -> vote_delegations_from_ids
    {
        ownViewModels: [ViewMeetingUser],
        foreignViewModel: ViewMeetingUser,
        ownField: `vote_delegated_to`,
        ownIdField: `vote_delegated_to_id`,
        many: false,
        generic: false
    },
    // vote_delegations_from_ids -> vote_delegated_to_id
    {
        ownViewModels: [ViewMeetingUser],
        foreignViewModel: ViewMeetingUser,
        ownField: `vote_delegations_from`,
        ownIdField: `vote_delegations_from_ids`,
        many: true,
        generic: false
    },
    ...makeM2O({
        OViewModel: ViewUser,
        MViewModel: ViewPollCandidate,
        OField: `poll_candidates`,
        MField: `user`
    }),
    // ########## Committees
    ...makeM2O({
        OViewModel: ViewCommittee,
        MViewModel: ViewMeeting,
        OField: `meetings`,
        MField: `committee`
    }),
    ...makeO2O({
        AViewModel: ViewCommittee,
        BViewModel: ViewMeeting,
        AField: `default_meeting`,
        BField: `default_meeting_for_committee`
    }),
    ...makeM2M({
        AViewModel: ViewCommittee,
        BViewModel: ViewUser,
        AField: `users`,
        BField: `committees`,
        BIdField: `committee_ids`
    }),
    ...makeM2M({
        AViewModel: ViewCommittee,
        BViewModel: ViewCommittee,
        AField: `forward_to_committees`,
        BField: `receive_forwardings_from_committees`
    }),
    ...makeM2O({
        OViewModel: ViewCommittee,
        MViewModel: ViewUser,
        OField: `native_users`,
        MField: `home_committee`
    }),
    ...makeM2O({
        OViewModel: ViewCommittee,
        MViewModel: ViewCommittee,
        OField: `all_parents`,
        MField: `committee`
    }),
    ...makeM2O({
        OViewModel: ViewCommittee,
        MViewModel: ViewCommittee,
        OField: `all_childs`,
        MField: `committee`
    }),
    ...makeO2O({
        AViewModel: ViewCommittee,
        BViewModel: ViewCommittee,
        AField: `parent`,
        BField: `committee`
    }),
    // ########## Meetings
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewMotionWorkflow,
        AField: `motions_default_workflow`,
        BField: `default_workflow_meeting`
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewMotionWorkflow,
        AField: `motions_default_amendment_workflow`,
        BField: `default_amendment_workflow_meeting`
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewGroup,
        OField: `motion_poll_default_groups`,
        MField: `used_as_motion_poll_default`
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewGroup,
        OField: `assignment_poll_default_groups`,
        MField: `used_as_assignment_poll_default`
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewGroup,
        OField: `topic_poll_default_groups`,
        MField: `used_as_topic_poll_default`
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewPointOfOrderCategory,
        OField: `point_of_order_categories`,
        OIdField: `point_of_order_category_ids`,
        MField: `meeting`
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewProjector,
        OField: `projectors`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewProjection,
        OField: `all_projections`,
        MField: `meeting`
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewProjection,
        OField: `projections`,
        MField: `meeting`
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewProjectorMessage,
        OField: `projector_messages`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewProjectorCountdown,
        OField: `projector_countdowns`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewTag,
        OField: `tags`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewAgendaItem,
        OField: `agenda_items`,
        MField: `meeting`,
        order: `weight`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewListOfSpeakers,
        OField: `lists_of_speakers`,
        OIdField: `list_of_speakers_ids`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewSpeaker,
        OField: `speakers`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewTopic,
        OField: `topics`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewGroup,
        OField: `groups`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewPersonalNote,
        OField: `personal_notes`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMediafile,
        OField: `mediafiles`,
        MField: `meeting`,
        isExclusiveList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMeetingMediafile,
        OField: `meeting_mediafiles`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewOrganization,
        MViewModel: ViewMediafile,
        OField: `published_mediafiles`,
        MField: `published_to_meetings_in_organization`
    }),
    ...makeM2O({
        OViewModel: ViewMediafile,
        MViewModel: ViewMeetingMediafile,
        OField: `meeting_mediafiles`,
        MField: `mediafile`
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotion,
        OField: `motions`,
        MField: `meeting`,
        isExclusiveList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionCommentSection,
        OField: `motion_comment_sections`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionComment,
        OField: `motion_comments`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionCategory,
        OField: `motion_categories`,
        OIdField: `motion_category_ids`,
        MField: `meeting`,
        order: `weight`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionBlock,
        OField: `motion_blocks`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionSubmitter,
        OField: `motion_submitters`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionEditor,
        OField: `motion_editors`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionWorkingGroupSpeaker,
        OField: `motion_working_group_speakers`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionChangeRecommendation,
        OField: `motion_change_recommendations`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionWorkflow,
        OField: `motion_workflows`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionState,
        OField: `motion_states`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewPoll,
        OField: `polls`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewOption,
        OField: `options`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewVote,
        OField: `votes`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewAssignment,
        OField: `assignments`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewAssignmentCandidate,
        OField: `assignment_candidates`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2M({
        AViewModel: ViewMeeting,
        BViewModel: ViewUser,
        AField: `present_users`,
        BField: `is_present_in_meetings`
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewProjector,
        AField: `reference_projector`,
        BField: `used_as_reference_projector_in_meeting`
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewChatGroup,
        OField: `chat_groups`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewChatMessage,
        OField: `chat_messages`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewPollCandidateList,
        OField: `poll_candidate_lists`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewPollCandidate,
        OField: `poll_candidates`,
        MField: `meeting`,
        isFullList: true
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewProjectorCountdown,
        AField: `list_of_speakers_countdown`,
        BField: `used_as_list_of_speakers_countdown_meeting`
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewProjectorCountdown,
        AField: `poll_countdown`,
        BField: `used_as_poll_countdown_meeting`
    }),
    ...makeManyDynamicallyNamedM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewProjector,
        config: PROJECTIONDEFAULTS.map(place => ({
            OField: `default_projectors_${place}` as ViewMeetingDefaultProjectorsKey,
            OIdField: `default_projector_${place}_ids` as MeetingDefaultProjectorIdsKey,
            MField: `used_as_default_${place}_in_meeting` as ViewProjectorMeetingUsageKey
        }))
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewGroup,
        AField: `default_group`,
        BField: `default_group_for_meeting`
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewGroup,
        AField: `anonymous_group`,
        BField: `anonymous_group_for_meeting`
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewGroup,
        AField: `admin_group`,
        BField: `admin_group_for_meeting`
    }),
    ...makeManyDynamicallyNamedO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewMeetingMediafile,
        config: [
            ...LOGO_PLACES.map(place => ({
                AField: `logo_${place}` as ViewMeetingMediafileUsageKey,
                BField: `used_as_logo_${place}_in_meeting` as ViewMediafileMeetingUsageKey
            })),
            ...FONT_PLACES.map(place => ({
                AField: `font_${place}` as ViewMeetingMediafileUsageKey,
                BField: `used_as_font_${place}_in_meeting` as ViewMediafileMeetingUsageKey
            }))
        ]
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewStructureLevel,
        OField: `structure_levels`,
        MField: `meeting`,
        isFullList: true
    }),

    // meeting/user_ids -> user
    {
        ownViewModels: [ViewMeeting],
        foreignViewModel: ViewUser,
        ownField: `users`,
        ownIdField: `user_ids`,
        many: true,
        generic: false
    },
    // user/meeting_ids -> meeting
    {
        ownViewModels: [ViewUser],
        foreignViewModel: ViewMeeting,
        ownField: `meetings`,
        ownIdField: `meeting_ids`,
        many: true,
        generic: false
    },
    // ########## Personal notes
    ...makeGenericO2M<ViewPersonalNote>({
        OViewModel: ViewPersonalNote,
        MPossibleViewModels: [ViewMotion],
        OViewModelField: `content_object`,
        MPossibleViewModelsField: `personal_notes`
    }),
    // ########## Tags
    ...makeGenericM2M<ViewTag, HasTags>({
        viewModel: ViewTag,
        possibleViewModels: [ViewAgendaItem, ViewAssignment, ViewMotion],
        viewModelField: `tagged`,
        viewModelIdField: `tagged_ids`,
        possibleViewModelsField: `tags`
    }),
    // ########## Agenda items
    ...makeGenericO2O<ViewAgendaItem, HasAgendaItem>({
        viewModel: ViewAgendaItem,
        possibleViewModels: [ViewMotion, ViewMotionBlock, ViewAssignment, ViewTopic],
        viewModelField: `content_object`,
        possibleViewModelsField: `agenda_item`
    }),
    ...makeM2O({
        MViewModel: ViewAgendaItem,
        OViewModel: ViewAgendaItem,
        MField: `parent`,
        OField: `children`,
        OIdField: `child_ids`
    }),
    // ########## Lists of speakers
    ...makeGenericO2O<ViewListOfSpeakers, HasListOfSpeakers>({
        viewModel: ViewListOfSpeakers,
        possibleViewModels: [ViewMotion, ViewMotionBlock, ViewAssignment, ViewTopic, ViewMediafile],
        viewModelField: `content_object`,
        possibleViewModelsField: `list_of_speakers`
    }),
    ...makeM2O({
        MViewModel: ViewSpeaker,
        OViewModel: ViewListOfSpeakers,
        MField: `list_of_speakers`,
        OField: `speakers`
    }),
    ...makeM2O({
        MViewModel: ViewStructureLevelListOfSpeakers,
        OViewModel: ViewListOfSpeakers,
        MField: `list_of_speakers`,
        OField: `structure_level_list_of_speakers`,
        OIdField: `structure_level_list_of_speakers_ids`
    }),
    ...makeM2O({
        MViewModel: ViewSpeaker,
        OViewModel: ViewStructureLevelListOfSpeakers,
        MField: `structure_level_list_of_speakers`,
        MIdField: `structure_level_list_of_speakers_id`,
        OField: `speakers`
    }),

    // ########## Motions
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotion,
        MField: `lead_motion`,
        OField: `amendments`
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotion,
        MField: `sort_parent`,
        OField: `sort_children`,
        OIdField: `sort_child_ids`
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotion,
        MField: `origin`,
        OField: `derived_motions`
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMeeting,
        MField: `origin_meeting`,
        OField: `forwarded_motions`
    }),
    ...makeM2M({
        AViewModel: ViewMotion,
        BViewModel: ViewMotion,
        AField: `all_origins`,
        BField: `all_derived_motions`
    }),
    ...makeM2M({
        AViewModel: ViewMotion,
        BViewModel: ViewMotion,
        AField: `identical_motions`,
        BField: `identical_motions`
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotionState,
        MField: `state`,
        OField: `motions`
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotionState,
        MField: `recommendation`,
        OField: `motions`
    }),
    ...makeGenericM2M<ViewMotion, HasReferencedMotionsInExtension>({
        viewModel: ViewMotion,
        possibleViewModels: [ViewMotion],
        viewModelField: `state_extension_references`,
        possibleViewModelsField: `referenced_in_motion_state_extensions`
    }),
    ...makeGenericM2M<ViewMotion, HasReferencedMotionsInExtension>({
        viewModel: ViewMotion,
        possibleViewModels: [ViewMotion],
        viewModelField: `recommendation_extension_references`,
        possibleViewModelsField: `referenced_in_motion_recommendation_extensions`
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotionCategory,
        MField: `category`,
        OField: `motions`,
        order: `category_weight`
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotionBlock,
        MField: `block`,
        OField: `motions`
    }),
    ...makeM2O({
        MViewModel: ViewMotionSubmitter,
        OViewModel: ViewMotion,
        MField: `motion`,
        OField: `submitters`,
        order: `weight`
    }),
    ...makeM2O({
        MViewModel: ViewMotionChangeRecommendation,
        OViewModel: ViewMotion,
        MField: `motion`,
        OField: `change_recommendations`,
        isExclusiveList: true
    }),
    ...makeM2O({
        MViewModel: ViewMotionComment,
        OViewModel: ViewMotion,
        MField: `motion`,
        OField: `comments`
    }),
    ...makeM2O({
        MViewModel: ViewMotionEditor,
        OViewModel: ViewMotion,
        MField: `motion`,
        OField: `editors`,
        order: `weight`
    }),
    ...makeM2O({
        MViewModel: ViewMotionWorkingGroupSpeaker,
        OViewModel: ViewMotion,
        MField: `motion`,
        OField: `working_group_speakers`,
        order: `weight`
    }),
    // ########## Motion comment sections
    ...makeM2O({
        MViewModel: ViewMotionComment,
        OViewModel: ViewMotionCommentSection,
        MField: `section`,
        OField: `comments`
    }),
    ...makeM2M({
        AViewModel: ViewMotionCommentSection,
        BViewModel: ViewGroup,
        AField: `read_groups`,
        BField: `read_comment_sections`
    }),
    ...makeM2M({
        AViewModel: ViewMotionCommentSection,
        BViewModel: ViewGroup,
        AField: `write_groups`,
        BField: `write_comment_sections`
    }),
    // ########## Motion category
    ...makeM2O({
        MViewModel: ViewMotionCategory,
        OViewModel: ViewMotionCategory,
        MField: `parent`,
        OField: `children`,
        OIdField: `child_ids`,
        order: `weight`
    }),
    // ########## Motion states
    ...makeM2M({
        AViewModel: ViewMotionState,
        BViewModel: ViewMotionState,
        AField: `next_states`,
        BField: `previous_states`
    }),
    ...makeM2O({
        MViewModel: ViewMotionState,
        OViewModel: ViewMotionState,
        MField: `submitter_withdraw_state`,
        OField: `submitter_withdraw_back_states`
    }),
    // ########## Motion workflow
    ...makeM2O({
        MViewModel: ViewMotionState,
        OViewModel: ViewMotionWorkflow,
        MField: `workflow`,
        OField: `states`
    }),
    ...makeO2O({
        AViewModel: ViewMotionWorkflow,
        BViewModel: ViewMotionState,
        AField: `first_state`,
        BField: `first_state_of_workflow`
    }),
    // ########## Point of order categories
    ...makeM2O({
        OViewModel: ViewPointOfOrderCategory,
        MViewModel: ViewSpeaker,
        OField: `speakers`,
        MField: `point_of_order_category`
    }),
    // ########## Polls
    ...makeGenericO2M({
        OViewModel: ViewPoll,
        MPossibleViewModels: [ViewMotion, ViewAssignment, ViewTopic],
        OViewModelField: `content_object`,
        MPossibleViewModelsField: `polls`
    }),
    ...makeM2M({
        AViewModel: ViewPoll,
        BViewModel: ViewGroup,
        AField: `entitled_groups`,
        BField: `polls`
    }),
    ...makeM2O({
        MViewModel: ViewOption,
        OViewModel: ViewPoll,
        MField: `poll`,
        OField: `options`
    }),
    ...makeO2O({
        AViewModel: ViewOption,
        BViewModel: ViewPoll,
        AField: `used_as_global_option_in_poll`,
        BField: `global_option`
    }),
    // ViewOption -> ViewUser, ViewPollCandidateList
    {
        ownViewModels: [ViewOption],
        foreignViewModelPossibilities: [ViewUser, ViewPollCandidateList, ViewMotion],
        ownField: `content_object`,
        many: false,
        generic: true
    },
    // ViewUser -> ViewOption
    {
        ownViewModels: [ViewUser],
        foreignViewModel: ViewOption,
        ownField: `options`,
        many: true,
        generic: false
    },
    // ViewPollCandidateList -> ViewUser
    {
        ownViewModels: [ViewPollCandidateList],
        foreignViewModel: ViewOption,
        ownField: `option`,
        many: false,
        generic: false
    },
    ...makeM2O({
        MViewModel: ViewVote,
        OViewModel: ViewOption,
        MField: `option`,
        OField: `votes`
    }),
    // ########## Assignments
    ...makeM2O({
        MViewModel: ViewAssignmentCandidate,
        OViewModel: ViewAssignment,
        MField: `assignment`,
        OField: `candidates`,
        order: `weight`
    }),
    // ########## Mediafile
    ...makeM2O({
        MViewModel: ViewMediafile,
        OViewModel: ViewMediafile,
        MField: `parent`,
        OField: `children`,
        OIdField: `child_ids`
    }),
    // ########## Meeting Mediafile
    ...makeM2M({
        AViewModel: ViewMeetingMediafile,
        BViewModel: ViewGroup,
        AField: `access_groups`,
        BField: `meeting_mediafile_access_groups`
    }),
    ...makeM2M({
        AViewModel: ViewMeetingMediafile,
        BViewModel: ViewGroup,
        AField: `inherited_access_groups`,
        BField: `meeting_mediafile_inherited_access_groups`
    }),
    ...makeGenericM2M<ViewMeetingMediafile, HasAttachmentMeetingMediafiles>({
        viewModel: ViewMeetingMediafile,
        possibleViewModels: [ViewTopic, ViewMotion, ViewAssignment],
        viewModelField: `attachment_ids`,
        possibleViewModelsField: `attachment_meeting_mediafiles`
    }),
    // ########## Chat
    ...makeM2O({
        OViewModel: ViewChatGroup,
        MViewModel: ViewChatMessage,
        OField: `chat_messages`,
        MField: `chat_group`
    }),
    ...makeM2M({
        AViewModel: ViewChatGroup,
        BViewModel: ViewGroup,
        AField: `read_groups`,
        BField: `read_chat_groups`
    }),
    ...makeM2M({
        AViewModel: ViewChatGroup,
        BViewModel: ViewGroup,
        AField: `write_groups`,
        BField: `write_chat_groups`
    }),
    // ########## Projector
    ...makeM2O({
        MViewModel: ViewProjection,
        OViewModel: ViewProjector,
        MField: `current_projector`,
        OField: `current_projections`,
        order: `weight`
    }),
    ...makeM2O({
        MViewModel: ViewProjection,
        OViewModel: ViewProjector,
        MField: `preview_projector`,
        OField: `preview_projections`,
        order: `weight`
    }),
    ...makeM2O({
        MViewModel: ViewProjection,
        OViewModel: ViewProjector,
        MField: `history_projector`,
        OField: `history_projections`,
        order: `weight`
    }),
    // ########## Projections
    // This is a generic O2M: projection <M---1> content_object
    // projection -> content_objects
    {
        ownViewModels: [ViewProjection],
        foreignViewModelPossibilities: PROJECTABLE_VIEW_MODELS,
        ownField: `content_object`,
        ownIdField: `content_object_id`,
        many: false,
        generic: true
    },
    // content_objects -> projection
    {
        ownViewModels: PROJECTABLE_VIEW_MODELS,
        foreignViewModel: ViewProjection,
        ownField: `projections`,
        ownIdField: `projection_ids`,
        many: true,
        generic: false
    },
    // ########## PollCandidateList
    ...makeM2O({
        OViewModel: ViewPollCandidateList,
        MViewModel: ViewPollCandidate,
        OField: `poll_candidates`,
        MField: `poll_candidate_list`
    }),
    // ########## StructureLevel
    ...makeM2O({
        MViewModel: ViewStructureLevelListOfSpeakers,
        OViewModel: ViewStructureLevel,
        MField: `structure_level`,
        OField: `structure_level_list_of_speakers`,
        OIdField: `structure_level_list_of_speakers_ids`
    }),
    // ########## History collections
    ...makeM2O({
        MViewModel: ViewHistoryEntry,
        OViewModel: ViewHistoryPosition,
        MField: `position`,
        OField: `entries`,
        OIdField: `entry_ids`
    }),
    ...makeM2O({
        MViewModel: ViewHistoryEntry,
        OViewModel: ViewMeeting,
        MField: `meeting`,
        OField: `relevant_history_entries`,
        OIdField: `relevant_history_entry_ids`
    }),
    ...makeM2O({
        MViewModel: ViewHistoryPosition,
        OViewModel: ViewUser,
        MField: `user`,
        OField: `history_positions`
    }),
    ...makeGenericO2M({
        OViewModel: ViewHistoryEntry,
        MPossibleViewModels: [ViewMotion, ViewAssignment, ViewUser],
        OViewModelField: `model`,
        MPossibleViewModelsField: `history_entries`,
        MPossibleViewModelsIdField: `history_entry_ids`
    })
];
