import { HasAgendaItem, ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { HasListOfSpeakers, ViewListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { ViewSpeaker } from 'app/site/agenda/models/view-speaker';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { ViewAssignmentCandidate } from 'app/site/assignments/models/view-assignment-candidate';
import { ViewAssignmentOption } from 'app/site/assignments/models/view-assignment-option';
import { ViewAssignmentPoll } from 'app/site/assignments/models/view-assignment-poll';
import { ViewAssignmentVote } from 'app/site/assignments/models/view-assignment-vote';
import { BaseViewModel, ViewModelConstructor } from 'app/site/base/base-view-model';
import { Projectable } from 'app/site/base/projectable';
import { ViewCommittee } from 'app/site/event-management/models/view-committee';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewOrganisation } from 'app/site/event-management/models/view-organisation';
import { ViewResource } from 'app/site/event-management/models/view-resource';
import { ViewRole } from 'app/site/event-management/models/view-role';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionBlock } from 'app/site/motions/models/view-motion-block';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { ViewMotionChangeRecommendation } from 'app/site/motions/models/view-motion-change-recommendation';
import { ViewMotionComment } from 'app/site/motions/models/view-motion-comment';
import { ViewMotionCommentSection } from 'app/site/motions/models/view-motion-comment-section';
import { ViewMotionOption } from 'app/site/motions/models/view-motion-option';
import { ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { ViewMotionStatuteParagraph } from 'app/site/motions/models/view-motion-statute-paragraph';
import { ViewMotionSubmitter } from 'app/site/motions/models/view-motion-submitter';
import { ViewMotionVote } from 'app/site/motions/models/view-motion-vote';
import { ViewMotionWorkflow } from 'app/site/motions/models/view-motion-workflow';
import { ViewProjection } from 'app/site/projector/models/view-projection';
import { ViewProjectiondefault } from 'app/site/projector/models/view-projectiondefault';
import { ViewProjector } from 'app/site/projector/models/view-projector';
import { ViewProjectorCountdown } from 'app/site/projector/models/view-projector-countdown';
import { ViewProjectorMessage } from 'app/site/projector/models/view-projector-message';
import { HasTags, ViewTag } from 'app/site/tags/models/view-tag';
import { ViewTopic } from 'app/site/topics/models/view-topic';
import { ViewGroup } from 'app/site/users/models/view-group';
import { HasPersonalNote, ViewPersonalNote } from 'app/site/users/models/view-personal-note';
import { ViewUser } from 'app/site/users/models/view-user';
import { makeGenericM2M, makeGenericO2O, makeM2M, makeM2O, makeO2O, Relation } from '../definitions/relations';

const PROJECTABLE_VIEW_MODELS: ViewModelConstructor<BaseViewModel & Projectable>[] = [
    ViewMotion,
    ViewMediafile,
    ViewListOfSpeakers,
    ViewMotionBlock,
    ViewAssignment,
    ViewAgendaItem,
    ViewUser,
    ViewAssignmentPoll,
    ViewMotionPoll,
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
        MViewModel: ViewRole,
        OField: 'roles',
        MField: 'organisation'
    }),
    ...makeM2O({
        OViewModel: ViewOrganisation,
        MViewModel: ViewResource,
        OField: 'resources',
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
        otherViewModel: ViewMotionPoll,
        structuredField: 'motion_poll_voted',
        structuredIdField: 'motion_poll_voted_$_ids',
        otherViewModelField: 'voted'
    }),
    ...makeOneStructuredUser2MRelation({
        otherViewModel: ViewMotionVote,
        structuredField: 'motion_votes',
        structuredIdField: 'motion_vote_$_ids',
        otherViewModelField: 'user'
    }),
    ...makeOneStructuredUser2MRelation({
        otherViewModel: ViewAssignmentCandidate,
        structuredField: 'assignment_candidates',
        structuredIdField: 'assignment_candidate_$_ids',
        otherViewModelField: 'user'
    }),
    ...makeManyStructuredUsers2MRelation({
        otherViewModel: ViewAssignmentPoll,
        structuredField: 'assignment_poll_voted',
        structuredIdField: 'assignment_poll_voted_$_ids',
        otherViewModelField: 'voted'
    }),
    ...makeOneStructuredUser2MRelation({
        otherViewModel: ViewAssignmentOption,
        structuredField: 'assignment_options',
        structuredIdField: 'assignment_option_$_ids',
        otherViewModelField: 'user'
    }),
    ...makeOneStructuredUser2MRelation({
        otherViewModel: ViewAssignmentVote,
        structuredField: 'assignment_votes',
        structuredIdField: 'assignment_vote_$_ids',
        otherViewModelField: 'user'
    }),
    // ########## Role
    ...makeM2O({
        OViewModel: ViewRole,
        MViewModel: ViewUser,
        OField: 'users',
        MField: 'role'
    }),
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
        AField: 'motions_default_statute_amendments_workflow',
        BField: 'default_statute_amendments_meeting'
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
        MViewModel: ViewProjectiondefault,
        OField: 'projectiondefaults',
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
        MField: 'meeting'
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
        MViewModel: ViewMotionCategory,
        OField: 'motion_categories',
        OIdField: 'motion_category_ids',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionBlock,
        OField: 'motion_blocks',
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
        MViewModel: ViewMotionStatuteParagraph,
        OField: 'motion_statute_paragraphs',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewMotionPoll,
        OField: 'motion_polls',
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
        MViewModel: ViewAssignmentPoll,
        OField: 'assignment_polls',
        MField: 'meeting'
    }),
    ...makeM2O({
        OViewModel: ViewMeeting,
        MViewModel: ViewUser,
        OField: 'present_users',
        MField: 'is_present_in_meetings'
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
    ...makeO2O({
        AViewModel: ViewMeeting,
        BViewModel: ViewProjector,
        AField: 'reference_projector',
        BField: 'used_as_reference_projector_in_meeting'
    }),
    // Logo -> meeting
    {
        ownViewModels: [ViewMediafile],
        foreignViewModel: ViewMeeting,
        ownField: 'used_as_logo_in_meeting',
        ownIdField: 'used_as_logo_$_in_meeting',
        many: false,
        generic: false,
        structured: true
    },
    // Meeting -> Logo
    {
        ownViewModels: [ViewMeeting],
        foreignViewModel: ViewMediafile,
        ownField: 'logo',
        ownIdField: 'logo_$',
        many: false,
        generic: false,
        structured: true
    },
    // Font -> meeting
    {
        ownViewModels: [ViewMediafile],
        foreignViewModel: ViewMeeting,
        ownField: 'used_as_font_in_meeting',
        ownIdField: 'used_as_font_$_in_meeting',
        many: false,
        generic: false,
        structured: true
    },
    // Meeting -> Font
    {
        ownViewModels: [ViewMeeting],
        foreignViewModel: ViewMediafile,
        ownField: 'font',
        ownIdField: 'font_$',
        many: false,
        generic: false,
        structured: true
    },
    // ########## Personal notes
    ...makeGenericO2O<ViewPersonalNote, HasPersonalNote>({
        viewModel: ViewPersonalNote,
        possibleViewModels: [ViewMotion],
        viewModelField: 'content_object',
        possibleViewModelsField: 'personal_notes'
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
        MViewModel: ViewMotionPoll,
        OViewModel: ViewMotion,
        MField: 'motion',
        OField: 'polls'
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
    // ########## Motion polls
    ...makeM2M({
        AViewModel: ViewMotionPoll,
        BViewModel: ViewGroup,
        AField: 'entitled_groups',
        BField: 'motion_polls'
    }),
    // ########## Motion options
    ...makeM2O({
        MViewModel: ViewMotionOption,
        OViewModel: ViewMotionPoll,
        MField: 'poll',
        OField: 'options'
    }),
    // ########## Motion votes
    ...makeM2O({
        MViewModel: ViewMotionVote,
        OViewModel: ViewMotionOption,
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
    ...makeM2O({
        MViewModel: ViewAssignmentPoll,
        OViewModel: ViewAssignment,
        MField: 'assignment',
        OField: 'polls'
    }),
    // ########## Assignment polls
    ...makeM2M({
        AViewModel: ViewAssignmentPoll,
        BViewModel: ViewGroup,
        AField: 'entitled_groups',
        BField: 'assignment_polls'
    }),
    // ########## Assignment options
    ...makeM2O({
        MViewModel: ViewAssignmentOption,
        OViewModel: ViewAssignmentPoll,
        MField: 'poll',
        OField: 'options'
    }),
    // ########## Assignment votes
    ...makeM2O({
        MViewModel: ViewAssignmentVote,
        OViewModel: ViewAssignmentOption,
        MField: 'option',
        OField: 'votes'
    }),
    // ########## Mediafile
    ...makeM2M({
        AViewModel: ViewMediafile,
        BViewModel: ViewGroup,
        AField: 'access_groups',
        BField: 'mediafile_access_groups'
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
        OField: 'current_projections'
    }),
    ...makeM2O({
        MViewModel: ViewProjection,
        OViewModel: ViewProjector,
        MField: 'preview_projector',
        OField: 'preview_projections'
    }),
    ...makeM2O({
        MViewModel: ViewProjection,
        OViewModel: ViewProjector,
        MField: 'history_projector',
        OField: 'history_projections'
    }),
    ...makeGenericM2M<ViewProjector, Projectable>({
        viewModel: ViewProjector,
        possibleViewModels: PROJECTABLE_VIEW_MODELS,
        viewModelField: 'current_elements',
        possibleViewModelsField: 'current_projectors'
    }),
    ...makeM2O({
        MViewModel: ViewProjectiondefault,
        OViewModel: ViewProjector,
        MField: 'projector',
        OField: 'projectiondefaults'
    }),
    // ########## Projections
    // This is a generic O2M: projection <M---1> element
    // projection -> elements
    {
        ownViewModels: [ViewProjection],
        foreignViewModelPossibilities: PROJECTABLE_VIEW_MODELS,
        ownField: 'element',
        ownIdField: 'element_id',
        many: false,
        generic: true,
        structured: false
    },
    // elements -> projection
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
