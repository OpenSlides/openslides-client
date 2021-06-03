import { ViewCommittee } from 'app/management/models/view-committee';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { ViewOrganisation } from 'app/management/models/view-organisation';
import { ViewOrganisationTag } from 'app/management/models/view-organisation-tag';
import { ViewResource } from 'app/management/models/view-resource';
import { ViewOption } from 'app/shared/models/poll/view-option';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewVote } from 'app/shared/models/poll/view-vote';
import { HasAgendaItem, ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { HasListOfSpeakers, ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { ViewAssignmentCandidate } from 'app/site/assignments/models/view-assignment-candidate';
import { BaseViewModel, ViewModelConstructor } from 'app/site/base/base-view-model';
import { Projectable } from 'app/site/base/projectable';
import { HasAttachment, ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { HasReferencedMotionsInRecommendationExtension, ViewMotion } from 'app/site/motions/models/view-motion';
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
import { HasTags, ViewTag } from 'app/site/tags/models/view-tag';
import { ViewTopic } from 'app/site/topics/models/view-topic';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewPersonalNote } from 'app/site/users/models/view-personal-note';
import { ViewUser } from 'app/site/users/models/view-user';
import {
    makeGenericM2M,
    makeGenericO2M,
    makeGenericO2O,
    makeM2M,
    makeM2O,
    makeO2O,
    Relation
} from '../definitions/relations';

const PROJECTABLE_VIEW_MODELS: ViewModelConstructor<BaseViewModel & Projectable>[] = [
    ViewMotion,
    ViewMediafile,
    ViewListOfSpeakers,
    ViewMotionBlock,
    ViewAssignment,
    ViewAgendaItem,
    ViewUser,
    ViewPoll,
    ViewProjectorMessage,
    ViewProjectorCountdown
];

interface MakeStructuredUserRelationArguments<V extends BaseViewModel> {
    otherViewModel: ViewModelConstructor<V>;
    structuredField: keyof ViewUser & string;
    structuredIdField: keyof ViewUser & string;
    otherViewModelField: keyof V & string;
    otherViewModelIdField?: keyof V & string;
}
function _makeStructuredUserRelation<V extends BaseViewModel>(
    args: MakeStructuredUserRelationArguments<V>,
    many: boolean
): Relation[] {
    return [
        // structured -> other
        {
            ownViewModels: [ViewUser],
            foreignViewModel: args.otherViewModel,
            ownField: args.structuredField,
            ownIdField: args.structuredIdField,
            many: true,
            generic: false,
            structured: true,
            ownIdFieldDefaultAttribute: 'active-meeting'
        },
        // other -> structured
        {
            ownViewModels: [args.otherViewModel],
            foreignViewModel: ViewUser,
            ownField: args.otherViewModelField,
            ownIdField: args.otherViewModelIdField,
            many: many,
            generic: false,
            structured: false
        }
    ];
}

function makeOneStructuredUser2MRelation<V extends BaseViewModel>(
    args: MakeStructuredUserRelationArguments<V>
): Relation[] {
    return _makeStructuredUserRelation(args, false);
}

function makeManyStructuredUsers2MRelation<V extends BaseViewModel>(
    args: MakeStructuredUserRelationArguments<V>
): Relation[] {
    return _makeStructuredUserRelation(args, true);
}

// Where to place relations (in this order):
// 1) For structured relations, the relation is defined on the structured side
// 2) For generic relations, the relation is defined on the generic side
// 3) Relations should assigned to the "higher" part of the relation. E.g.:
//     - The meeting<->committee relation is in the committee block.
//     - The motion<->category relation in in the motion block

export const RELATIONS: Relation[] = [
    // ########## Organisation
    ...makeM2O({
        OViewModel: ViewOrganisation,
        MViewModel: ViewCommittee,
        OField: 'committees',
        MField: 'organisation'
    }),
    ...makeM2O({
        OViewModel: ViewOrganisation,
        MViewModel: ViewResource,
        OField: 'resources',
        MField: 'organisation'
    }),
    ...makeM2O({
        OViewModel: ViewOrganisation,
        MViewModel: ViewOrganisationTag,
        OField: 'organisation_tags',
        MField: 'organisation'
    }),
    // ########## User
    ...makeManyStructuredUsers2MRelation({
        otherViewModel: ViewGroup,
        structuredField: 'groups',
        structuredIdField: 'group_$_ids',
        otherViewModelField: 'users'
    }),
    ...makeOneStructuredUser2MRelation({
        otherViewModel: ViewSpeaker,
        structuredField: 'speakers',
        structuredIdField: 'speaker_$_ids',
        otherViewModelField: 'user'
    }),
    ...makeOneStructuredUser2MRelation({
        otherViewModel: ViewPersonalNote,
        structuredField: 'personal_notes',
        structuredIdField: 'personal_note_$_ids',
        otherViewModelField: 'user'
    }),
    ...makeManyStructuredUsers2MRelation({
        otherViewModel: ViewMotion,
        structuredField: 'supported_motions',
        structuredIdField: 'supported_motion_$_ids',
        otherViewModelField: 'supporters'
    }),
    ...makeOneStructuredUser2MRelation({
        otherViewModel: ViewMotionSubmitter,
        structuredField: 'submitted_motions',
        structuredIdField: 'submitted_motion_$_ids',
        otherViewModelField: 'user'
    }),
    ...makeManyStructuredUsers2MRelation({
        otherViewModel: ViewPoll,
        structuredField: 'poll_voted',
        structuredIdField: 'poll_voted_$_ids',
        otherViewModelField: 'voted'
    }),
    ...makeOneStructuredUser2MRelation({
        otherViewModel: ViewVote,
        structuredField: 'votes',
        structuredIdField: 'vote_$_ids',
        otherViewModelField: 'user'
    }),
    ...makeOneStructuredUser2MRelation({
        otherViewModel: ViewVote,
        structuredField: 'votes',
        structuredIdField: 'delegated_vote_$_ids',
        otherViewModelField: 'delegated_user'
    }),
    ...makeOneStructuredUser2MRelation({
        otherViewModel: ViewAssignmentCandidate,
        structuredField: 'assignment_candidates',
        structuredIdField: 'assignment_candidate_$_ids',
        otherViewModelField: 'user'
    }),
    // ...makeOneStructuredGenericUser2MRelation({
    //     otherViewModel: ViewOption,
    //     structuredField: 'options',
    //     structuredIdField: 'option_$_ids',
    //     otherViewModelField: 'content_object'
    // }),
    // Vote delegations
    // vote_delegated_$_to_id -> vote_delegations_$_from_ids
    {
        ownViewModels: [ViewUser],
        foreignViewModel: ViewUser,
        ownField: 'vote_delegated_to',
        ownIdField: 'vote_delegated_$_to_id',
        many: false,
        generic: false,
        structured: true,
        ownIdFieldDefaultAttribute: 'active-meeting'
    },
    // vote_delegations_$_from_ids -> vote_delegated_$_to_id
    {
        ownViewModels: [ViewUser],
        foreignViewModel: ViewUser,
        ownField: 'vote_delegations_from',
        ownIdField: 'vote_delegations_$_from_ids',
        many: true,
        generic: false,
        structured: true,
        ownIdFieldDefaultAttribute: 'active-meeting'
    },
    // ########## Committees
    ...makeM2O({
        OViewModel: ViewCommittee,
        MViewModel: ViewMeeting,
        OField: 'meetings',
        MField: 'committee'
    }),
    ...makeO2O({
        AViewModel: ViewCommittee,
        BViewModel: ViewMeeting,
        AField: 'default_meeting',
        BField: 'default_meeting_for_committee'
    }),
    ...makeO2O({
        AViewModel: ViewCommittee,
        BViewModel: ViewMeeting,
        AField: 'template_meeting_id',
        BField: 'template_meeting_for_committee_id'
    }),
    ...makeM2M({
        AViewModel: ViewCommittee,
        BViewModel: ViewUser,
        AField: 'members',
        BField: 'committees_as_member',
        BIdField: 'committee_as_member_ids'
    }),
    ...makeM2M({
        AViewModel: ViewCommittee,
        BViewModel: ViewUser,
        AField: 'managers',
        BField: 'committees_as_manager',
        BIdField: 'committee_as_manager_ids'
    }),
    ...makeM2M({
        AViewModel: ViewCommittee,
        BViewModel: ViewCommittee,
        AField: 'forward_to_committees',
        BField: 'receive_forwardings_from_committees'
    }),
    ...makeM2M({
        AViewModel: ViewCommittee,
        BViewModel: ViewOrganisationTag,
        AField: 'organisation_tags',
        BField: 'committees'
    }),
    // ########## Meetings
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewMotionWorkflow,
        AField: 'motions_default_workflow',
        BField: 'default_workflow_meeting'
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewMotionWorkflow,
        AField: 'motions_default_amendment_workflow',
        BField: 'default_amendment_workflow_meeting'
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewMotionWorkflow,
        AField: 'motions_default_statute_amendment_workflow',
        BField: 'default_statute_amendment_workflow_meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewGroup,
        OField: 'motion_poll_default_groups',
        MField: 'used_as_motion_poll_default'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewGroup,
        OField: 'assignment_poll_default_groups',
        MField: 'used_as_assignment_poll_default'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewProjector,
        OField: 'projectors',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewProjection,
        OField: 'projections',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewProjectorMessage,
        OField: 'projector_messages',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewProjectorCountdown,
        OField: 'projector_countdowns',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewTag,
        OField: 'tags',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewAgendaItem,
        OField: 'agenda_items',
        MField: 'meeting',
        order: 'weight'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewListOfSpeakers,
        OField: 'lists_of_speakers',
        OIdField: 'list_of_speakers_ids',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewSpeaker,
        OField: 'speaker_ids',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewTopic,
        OField: 'topics',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewGroup,
        OField: 'groups',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewPersonalNote,
        OField: 'personal_notes',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMediafile,
        OField: 'mediafiles',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotion,
        OField: 'motions',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionCommentSection,
        OField: 'motion_comment_sections',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionComment,
        OField: 'motion_comments',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionCategory,
        OField: 'motion_categories',
        OIdField: 'motion_category_ids',
        MField: 'meeting',
        order: 'weight'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionBlock,
        OField: 'motion_blocks',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionSubmitter,
        OField: 'motion_submitters',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionChangeRecommendation,
        OField: 'motion_change_recommendations',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionWorkflow,
        OField: 'motion_workflows',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionState,
        OField: 'motion_states',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionStatuteParagraph,
        OField: 'motion_statute_paragraphs',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewPoll,
        OField: 'polls',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewOption,
        OField: 'options',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewVote,
        OField: 'votes',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewAssignment,
        OField: 'assignments',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewAssignmentCandidate,
        OField: 'assignment_candidates',
        MField: 'meeting'
    }),
    ...makeM2M({
        AViewModel: ViewMeeting,
        BViewModel: ViewUser,
        AField: 'present_users',
        BField: 'is_present_in_meetings'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewUser,
        OField: 'temporary_users',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewUser,
        OField: 'guests',
        MField: 'guest_meetings'
    }),
    ...makeM2M({
        AViewModel: ViewMeeting,
        BViewModel: ViewOrganisationTag,
        AField: 'organisation_tags',
        BField: 'meetings'
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewProjector,
        AField: 'reference_projector',
        BField: 'used_as_reference_projector_in_meeting'
    }),
    // Projector -> Meeting
    {
        ownViewModels: [ViewProjector],
        foreignViewModel: ViewMeeting,
        ownField: 'used_as_default_in_meeting',
        ownIdField: 'used_as_default_$_in_meeting_id',
        many: false,
        generic: false,
        structured: true
    },
    // Meeting -> Projector
    {
        ownViewModels: [ViewMeeting],
        foreignViewModel: ViewProjector,
        ownField: 'default_projector',
        ownIdField: 'default_projector_$_id',
        many: false,
        generic: false,
        structured: true
    },
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewGroup,
        AField: 'default_group',
        BField: 'default_group_for_meeting'
    }),
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewGroup,
        AField: 'admin_group',
        BField: 'admin_group_for_meeting'
    }),
    // Logo -> meeting
    {
        ownViewModels: [ViewMediafile],
        foreignViewModel: ViewMeeting,
        ownField: 'used_as_logo_in_meeting',
        ownIdField: 'used_as_logo_$_in_meeting_id',
        many: false,
        generic: false,
        structured: true
    },
    // Meeting -> Logo
    {
        ownViewModels: [ViewMeeting],
        foreignViewModel: ViewMediafile,
        ownField: 'logo',
        ownIdField: 'logo_$_id',
        many: false,
        generic: false,
        structured: true
    },
    // Font -> meeting
    {
        ownViewModels: [ViewMediafile],
        foreignViewModel: ViewMeeting,
        ownField: 'used_as_font_in_meeting',
        ownIdField: 'used_as_font_$_in_meeting_id',
        many: false,
        generic: false,
        structured: true
    },
    // Meeting -> Font
    {
        ownViewModels: [ViewMeeting],
        foreignViewModel: ViewMediafile,
        ownField: 'font',
        ownIdField: 'font_$_id',
        many: false,
        generic: false,
        structured: true
    },
    // meeting/user_ids -> user
    {
        ownViewModels: [ViewMeeting],
        foreignViewModel: ViewUser,
        ownField: 'users',
        ownIdField: 'user_ids',
        many: true,
        generic: false,
        structured: false
    },
    // ########## Personal notes
    ...makeGenericO2M<ViewPersonalNote>({
        OViewModel: ViewPersonalNote,
        MPossibleViewModels: [ViewMotion],
        OViewModelField: 'content_object',
        MPossibleViewModelsField: 'personal_notes'
    }),
    // ########## Tags
    ...makeGenericM2M<ViewTag, HasTags>({
        viewModel: ViewTag,
        possibleViewModels: [ViewAgendaItem, ViewAssignment, ViewMotion, ViewTopic],
        viewModelField: 'tagged',
        viewModelIdField: 'tagged_ids',
        possibleViewModelsField: 'tags'
    }),
    // ########## Agenda items
    ...makeGenericO2O<ViewAgendaItem, HasAgendaItem>({
        viewModel: ViewAgendaItem,
        possibleViewModels: [ViewMotion, ViewMotionBlock, ViewAssignment, ViewTopic],
        viewModelField: 'content_object',
        possibleViewModelsField: 'agenda_item'
    }),
    ...makeM2O({
        MViewModel: ViewAgendaItem,
        OViewModel: ViewAgendaItem,
        MField: 'parent',
        OField: 'children',
        OIdField: 'child_ids'
    }),
    // ########## Lists of speakers
    ...makeGenericO2O<ViewListOfSpeakers, HasListOfSpeakers>({
        viewModel: ViewListOfSpeakers,
        possibleViewModels: [ViewMotion, ViewMotionBlock, ViewAssignment, ViewTopic, ViewMediafile],
        viewModelField: 'content_object',
        possibleViewModelsField: 'list_of_speakers'
    }),
    ...makeM2O({
        MViewModel: ViewSpeaker,
        OViewModel: ViewListOfSpeakers,
        MField: 'list_of_speakers',
        OField: 'speakers'
    }),
    // ########## Motions
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotion,
        MField: 'lead_motion',
        OField: 'amendments'
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotion,
        MField: 'sort_parent',
        OField: 'sort_children',
        OIdField: 'sort_child_ids'
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotion,
        MField: 'origin',
        OField: 'derived_motions'
    }),
    // motion/forwarding_tree_motion_ids -> Motion
    {
        ownViewModels: [ViewMotion],
        foreignViewModel: ViewMotion,
        ownField: 'forwarding_tree_motions',
        ownIdField: 'forwarding_tree_motion_ids',
        many: true,
        generic: false,
        structured: false
    },
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotionState,
        MField: 'state',
        OField: 'motions'
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotionState,
        MField: 'recommendation',
        OField: 'motions'
    }),
    ...makeGenericM2M<ViewMotion, HasReferencedMotionsInRecommendationExtension>({
        viewModel: ViewMotion,
        possibleViewModels: [ViewMotion],
        viewModelField: 'recommendation_extension_reference_ids',
        possibleViewModelsField: 'referenced_in_motion_recommendation_extension'
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotionCategory,
        MField: 'category',
        OField: 'motions',
        order: 'category_weight'
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotionBlock,
        MField: 'block',
        OField: 'motions'
    }),
    ...makeM2O({
        MViewModel: ViewMotionSubmitter,
        OViewModel: ViewMotion,
        MField: 'motion',
        OField: 'submitters',
        order: 'weight'
    }),
    ...makeM2O({
        MViewModel: ViewMotionChangeRecommendation,
        OViewModel: ViewMotion,
        MField: 'motion',
        OField: 'change_recommendations'
    }),
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotionStatuteParagraph,
        MField: 'statute_paragraph',
        OField: 'motions'
    }),
    ...makeM2O({
        MViewModel: ViewMotionComment,
        OViewModel: ViewMotion,
        MField: 'motion',
        OField: 'comments'
    }),
    // ########## Motion comment sections
    ...makeM2O({
        MViewModel: ViewMotionComment,
        OViewModel: ViewMotionCommentSection,
        MField: 'section',
        OField: 'comments'
    }),
    ...makeM2M({
        AViewModel: ViewMotionCommentSection,
        BViewModel: ViewGroup,
        AField: 'read_groups',
        BField: 'read_comment_sections'
    }),
    ...makeM2M({
        AViewModel: ViewMotionCommentSection,
        BViewModel: ViewGroup,
        AField: 'write_groups',
        BField: 'write_comment_sections'
    }),
    // ########## Motion category
    ...makeM2O({
        MViewModel: ViewMotionCategory,
        OViewModel: ViewMotionCategory,
        MField: 'parent',
        OField: 'children',
        OIdField: 'child_ids',
        order: 'weight'
    }),
    // ########## Motion states
    ...makeM2M({
        AViewModel: ViewMotionState,
        BViewModel: ViewMotionState,
        AField: 'next_states',
        BField: 'previous_states'
    }),
    // ########## Motion workflow
    ...makeM2O({
        MViewModel: ViewMotionState,
        OViewModel: ViewMotionWorkflow,
        MField: 'workflow',
        OField: 'states'
    }),
    ...makeO2O({
        AViewModel: ViewMotionWorkflow,
        BViewModel: ViewMotionState,
        AField: 'first_state',
        BField: 'first_state_of_workflow'
    }),
    // ########## Polls
    ...makeGenericO2M({
        OViewModel: ViewPoll,
        MPossibleViewModels: [ViewMotion, ViewAssignment],
        OViewModelField: 'content_object',
        MPossibleViewModelsField: 'polls'
    }),
    ...makeM2M({
        AViewModel: ViewPoll,
        BViewModel: ViewGroup,
        AField: 'entitled_groups',
        BField: 'polls'
    }),
    ...makeM2O({
        MViewModel: ViewOption,
        OViewModel: ViewPoll,
        MField: 'poll',
        OField: 'options'
    }),
    ...makeO2O({
        AViewModel: ViewOption,
        BViewModel: ViewPoll,
        AField: 'poll',
        BField: 'global_option'
    }),
    ...makeGenericO2M({
        OViewModel: ViewOption,
        MPossibleViewModels: [ViewUser],
        OViewModelField: 'content_object',
        MPossibleViewModelsField: 'options'
    }),
    ...makeM2O({
        MViewModel: ViewVote,
        OViewModel: ViewOption,
        MField: 'option',
        OField: 'votes'
    }),
    // ########## Assignments
    ...makeM2O({
        MViewModel: ViewAssignmentCandidate,
        OViewModel: ViewAssignment,
        MField: 'assignment',
        OField: 'candidates',
        order: 'weight'
    }),
    // ########## Mediafile
    ...makeM2M({
        AViewModel: ViewMediafile,
        BViewModel: ViewGroup,
        AField: 'access_groups',
        BField: 'mediafile_access_groups'
    }),
    ...makeM2M({
        AViewModel: ViewMediafile,
        BViewModel: ViewGroup,
        AField: 'inherited_access_groups',
        BField: 'mediafile_inherited_access_groups'
    }),
    ...makeGenericM2M<ViewMediafile, HasAttachment>({
        viewModel: ViewMediafile,
        possibleViewModels: [ViewTopic, ViewMotion, ViewAssignment],
        viewModelField: 'attachment_ids',
        possibleViewModelsField: 'attachment_ids'
    }),
    ...makeM2O({
        MViewModel: ViewMediafile,
        OViewModel: ViewMediafile,
        MField: 'parent',
        OField: 'children',
        OIdField: 'child_ids'
    }),
    // ########## Projector
    ...makeM2O({
        MViewModel: ViewProjection,
        OViewModel: ViewProjector,
        MField: 'current_projector',
        OField: 'current_projections',
        order: 'weight'
    }),
    ...makeM2O({
        MViewModel: ViewProjection,
        OViewModel: ViewProjector,
        MField: 'preview_projector',
        OField: 'preview_projections',
        order: 'weight'
    }),
    ...makeM2O({
        MViewModel: ViewProjection,
        OViewModel: ViewProjector,
        MField: 'history_projector',
        OField: 'history_projections',
        order: 'weight'
    }),
    // ########## Projections
    // This is a generic O2M: projection <M---1> content_object
    // projection -> content_objects
    {
        ownViewModels: [ViewProjection],
        foreignViewModelPossibilities: PROJECTABLE_VIEW_MODELS,
        ownField: 'content_object',
        ownIdField: 'content_object_id',
        many: false,
        generic: true,
        structured: false
    },
    // content_objects -> projection
    {
        ownViewModels: PROJECTABLE_VIEW_MODELS,
        foreignViewModel: ViewProjection,
        ownField: 'projections',
        ownIdField: 'projection_ids',
        many: true,
        generic: false,
        structured: false
    }
];
