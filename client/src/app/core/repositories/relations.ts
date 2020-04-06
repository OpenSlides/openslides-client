import { ViewAgendaItem } from 'app/site/agenda/models/view-agenda-item';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { ViewMeeting } from 'app/site/event-management/models/view-meeting';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { ViewMotionBlock } from 'app/site/motions/models/view-motion-block';
import { ViewMotionCategory } from 'app/site/motions/models/view-motion-category';
import { ViewMotionState } from 'app/site/motions/models/view-motion-state';
import { ViewTag } from 'app/site/tags/models/view-tag';
import { ViewTopic } from 'app/site/topics/models/view-topic';
import { ViewGroup } from 'app/site/users/models/view-group';
import { ViewUser } from 'app/site/users/models/view-user';
import {
    makeGenericM2M,
    makeGenericO2O,
    makeM2M,
    makeM2O,
    makeStructuredM2M,
    Relation
} from '../definitions/relations';

export const RELATIONS: Relation[] = [
    ...makeM2O({
        MViewModel: ViewMotion,
        OViewModel: ViewMotionCategory,
        MField: 'category',
        OField: 'motions',
        order: 'category_weight'
    }),
    ...makeM2O({
        MViewModel: ViewMotionCategory,
        OViewModel: ViewMotionCategory,
        MField: 'parent',
        OField: 'children',
        OIdField: 'child_ids',
        order: 'weight'
    }),
    ...makeM2M({
        AViewModel: ViewMotionState,
        BViewModel: ViewMotionState,
        AField: 'next_states',
        BField: 'previous_states'
    }),
    ...makeGenericM2M({
        viewModel: ViewTag,
        possibleViewModels: [ViewAssignment, ViewMotion, ViewTopic],
        viewModelField: 'tagged',
        viewModelIdField: 'tagged_ids',
        possibleViewModelsField: 'tags'
    }),
    ...makeGenericO2O({
        viewModel: ViewAgendaItem,
        possibleViewModels: [ViewMotion, ViewTopic, ViewAssignment, ViewMotionBlock],
        viewModelField: 'content_object',
        possibleViewModelsField: 'agenda_item'
    }),
    ...makeStructuredM2M({
        structuredViewModel: ViewUser,
        otherViewModel: ViewGroup,
        structuredField: 'groups',
        structuredIdField: 'group_$_ids',
        structuredIdFieldDefaultAttribute: 'active-meeting',
        otherViewModelField: 'users'
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
    }
];

// These are all collected relations from all repos. These relations must be redone in the new format.
// The variablename indicates from which repo the relations are.
// Attention: These are not all relations: There are new ones in OS4.
/*
const AgendaItemRelations: RelationDefinition[] = [
    {
        type: 'generic',
        possibleModels: [ViewMotion, ViewMotionBlock, ViewTopic, ViewAssignment],
        isVForeign: isBaseViewModelWithAgendaItem,
        VForeignVerbose: 'BaseViewModelWithAgendaItem',
        ownContentObjectDataKey: 'contentObjectData',
        ownKey: 'content_object'
    }
];

const ListOfSpeakersRelations: RelationDefinition[] = [
    {
        type: 'generic',
        possibleModels: [ViewMotion, ViewMotionBlock, ViewTopic, ViewAssignment, ViewMediafile],
        isVForeign: isBaseViewModelWithListOfSpeakers,
        VForeignVerbose: 'BaseViewModelWithListOfSpeakers',
        ownContentObjectDataKey: 'contentObjectData',
        ownKey: 'content_object'
    }
];

const ListOfSpeakersNestedModelDescriptors: NestedModelDescriptors = {
    'agenda/list-of-speakers': [
        {
            ownKey: 'speakers',
            foreignViewModel: ViewSpeaker,
            foreignModel: Speaker,
            order: 'weight',
            relationDefinitionsByKey: {
                user: {
                    type: 'M2O',
                    ownIdKey: 'user_id',
                    ownKey: 'user',
                    foreignViewModel: ViewUser
                }
            },
            titles: {
                getTitle: (viewSpeaker: ViewSpeaker) => viewSpeaker.name
            }
        }
    ]
};

const AssignmentOptionRelations: RelationDefinition[] = [
    {
        type: 'O2M',
        foreignIdKey: 'option_id',
        ownKey: 'votes',
        foreignViewModel: ViewAssignmentVote
    },
    {
        type: 'M2O',
        ownIdKey: 'poll_id',
        ownKey: 'poll',
        foreignViewModel: ViewAssignmentPoll
    },
    {
        type: 'M2O',
        ownIdKey: 'user_id',
        ownKey: 'user',
        foreignViewModel: ViewUser
    }
];

const AssignmentPollRelations: RelationDefinition[] = [
    {
        type: 'M2M',
        ownIdKey: 'groups_id',
        ownKey: 'groups',
        foreignViewModel: ViewGroup
    },
    {
        type: 'O2M',
        ownIdKey: 'options_id',
        ownKey: 'options',
        foreignViewModel: ViewAssignmentOption
    },
    {
        type: 'M2O',
        ownIdKey: 'assignment_id',
        ownKey: 'assignment',
        foreignViewModel: ViewAssignment
    },
    {
        type: 'M2M',
        ownIdKey: 'voted_id',
        ownKey: 'voted',
        foreignViewModel: ViewUser
    }
];

const AssignmentRelations: RelationDefinition[] = [
    {
        type: 'M2M',
        ownIdKey: 'tags_id',
        ownKey: 'tags',
        foreignViewModel: ViewTag
    },
    {
        type: 'M2M',
        ownIdKey: 'attachment_ids',
        ownKey: 'attachments',
        foreignViewModel: ViewMediafile
    },
    {
        type: 'O2M',
        ownKey: 'polls',
        foreignIdKey: 'assignment_id',
        foreignViewModel: ViewAssignmentPoll
    }
];

const AssignmentNestedModelDescriptors: NestedModelDescriptors = {
    'assignments/assignment': [
        {
            ownKey: 'assignment_related_users',
            foreignViewModel: ViewAssignmentRelatedUser,
            foreignModel: AssignmentRelatedUser,
            order: 'weight',
            relationDefinitionsByKey: {
                user: {
                    type: 'M2O',
                    ownIdKey: 'user_id',
                    ownKey: 'user',
                    foreignViewModel: ViewUser
                }
            },
            titles: {
                getTitle: (viewAssignmentRelatedUser: ViewAssignmentRelatedUser) =>
                    viewAssignmentRelatedUser.user ? viewAssignmentRelatedUser.user.getFullName() : ''
            }
        }
    ]
};

const AssignmentVoteRelations: RelationDefinition[] = [
    {
        type: 'M2O',
        ownIdKey: 'user_id',
        ownKey: 'user',
        foreignViewModel: ViewUser
    },
    {
        type: 'M2O',
        ownIdKey: 'option_id',
        ownKey: 'option',
        foreignViewModel: ViewAssignmentOption
    }
];

const MediafileRelations: RelationDefinition[] = [
    {
        type: 'M2O',
        ownIdKey: 'parent_id',
        ownKey: 'parent',
        foreignViewModel: ViewMediafile
    },
    {
        type: 'M2M',
        ownIdKey: 'access_groups_id',
        ownKey: 'access_groups',
        foreignViewModel: ViewGroup
    },
    {
        type: 'M2M',
        ownIdKey: 'inherited_access_groups_id',
        ownKey: 'inherited_access_groups',
        foreignViewModel: ViewGroup
    }
];

const CategoryRelations: RelationDefinition[] = [
    {
        type: 'M2O',
        ownIdKey: 'parent_id',
        ownKey: 'parent',
        foreignViewModel: ViewCategory
    },
    {
        type: 'O2M',
        foreignIdKey: 'category_id',
        ownKey: 'motions',
        foreignViewModel: ViewMotion,
        order: 'category_weight'
    },
    {
        type: 'O2M',
        foreignIdKey: 'parent_id',
        ownKey: 'children',
        foreignViewModel: ViewCategory,
        order: 'weight'
    }
    {
        type: 'O2M',
        ownIdKey: 'children_ids',
        ownKey: 'children',
        foreignViewModel: ViewCategory
    },
    {
        type: 'O2M',
        ownIdKey: 'motion_ids',
        ownKey: 'motions',
        foreignViewModel: ViewMotion,
        order: 'category_weight'
    }
];

const MotionBlockRelations: RelationDefinition[] = [
    {
        type: 'O2M',
        foreignIdKey: 'motion_block_id',
        ownKey: 'motions',
        foreignViewModel: ViewMotion
    }
];

const MotionCommentSectionRelations: RelationDefinition[] = [
    {
        type: 'M2M',
        ownIdKey: 'read_groups_id',
        ownKey: 'read_groups',
        foreignViewModel: ViewGroup
    },
    {
        type: 'M2M',
        ownIdKey: 'write_groups_id',
        ownKey: 'write_groups',
        foreignViewModel: ViewGroup
    }
];

const MotionOptionRelations: RelationDefinition[] = [
    {
        type: 'O2M',
        foreignIdKey: 'option_id',
        ownKey: 'votes',
        foreignViewModel: ViewMotionVote
    },
    {
        type: 'M2O',
        ownIdKey: 'poll_id',
        ownKey: 'poll',
        foreignViewModel: ViewMotionPoll
    }
];

const MotionPollRelations: RelationDefinition[] = [
    {
        type: 'M2M',
        ownIdKey: 'groups_id',
        ownKey: 'groups',
        foreignViewModel: ViewGroup
    },
    {
        type: 'O2M',
        ownIdKey: 'options_id',
        ownKey: 'options',
        foreignViewModel: ViewMotionOption
    },
    {
        type: 'M2O',
        ownIdKey: 'motion_id',
        ownKey: 'motion',
        foreignViewModel: ViewMotion
    },
    {
        type: 'M2M',
        ownIdKey: 'voted_id',
        ownKey: 'voted',
        foreignViewModel: ViewUser
    }
];

const MotionRelations: RelationDefinition[] = [
    {
        type: 'M2O',
        ownIdKey: 'state_id',
        ownKey: 'state',
        foreignViewModel: ViewState
    },
    {
        type: 'M2O',
        ownIdKey: 'recommendation_id',
        ownKey: 'recommendation',
        foreignViewModel: ViewState
    },
    {
        type: 'M2O',
        ownIdKey: 'workflow_id',
        ownKey: 'workflow',
        foreignViewModel: ViewWorkflow
    },
    {
        type: 'M2O',
        ownIdKey: 'category_id',
        ownKey: 'category',
        foreignViewModel: ViewCategory
    },
    {
        type: 'M2O',
        ownIdKey: 'motion_block_id',
        ownKey: 'motion_block',
        foreignViewModel: ViewMotionBlock
    },
    {
        type: 'M2M',
        ownIdKey: 'supporters_id',
        ownKey: 'supporters',
        foreignViewModel: ViewUser
    },
    {
        type: 'M2M',
        ownIdKey: 'attachment_ids',
        ownKey: 'attachments',
        foreignViewModel: ViewMediafile
    },
    {
        type: 'M2M',
        ownIdKey: 'tags_id',
        ownKey: 'tags',
        foreignViewModel: ViewTag
    },
    {
        type: 'M2M',
        ownIdKey: 'change_recommendations_id',
        ownKey: 'changeRecommendations',
        foreignViewModel: ViewMotionChangeRecommendation
    },
    {
        type: 'O2M',
        foreignIdKey: 'parent_id',
        ownKey: 'amendments',
        foreignViewModel: ViewMotion
    },
    {
        type: 'M2O',
        ownIdKey: 'parent_id',
        ownKey: 'parent',
        foreignViewModel: ViewMotion
    },
    {
        type: 'O2M',
        foreignIdKey: 'motion_id',
        ownKey: 'polls',
        foreignViewModel: ViewMotionPoll
    }
    // Personal notes are dynamically added in the repo.
];

const MotionVoteRelations: RelationDefinition[] = [
    {
        type: 'M2O',
        ownIdKey: 'user_id',
        ownKey: 'user',
        foreignViewModel: ViewUser
    },
    {
        type: 'M2O',
        ownIdKey: 'option_id',
        ownKey: 'option',
        foreignViewModel: ViewMotionOption
    }
];

const MotionStateRelations: RelationDefinition[] = [
    {
        type: 'M2O',
        ownIdKey: 'workflow_id',
        ownKey: 'workflow',
        foreignViewModel: ViewMotionWorkflow
    },
    {
        type: 'M2M',
        ownIdKey: 'next_states_id',
        ownKey: 'next_states',
        foreignViewModel: ViewMotionState
    },
    {
        type: 'M2M',
        foreignIdKey: 'next_states_id',
        ownKey: 'previous_states',
        foreignViewModel: ViewMotionState
    }
];

const MotionWorkflowRelations: RelationDefinition[] = [
    {
        type: 'O2M',
        ownIdKey: 'states_id',
        ownKey: 'states',
        foreignViewModel: ViewMotionState
    },
    {
        type: 'M2O',
        ownIdKey: 'first_state_id',
        ownKey: 'first_state',
        foreignViewModel: ViewMotionState
    }
];

const ProjectorRelations: RelationDefinition[] = [
    {
        type: 'M2O',
        ownIdKey: 'reference_projector_id',
        ownKey: 'referenceProjector',
        foreignViewModel: ViewProjector
    }
];

const TopicRelations: RelationDefinition[] = [
    {
        type: 'M2M',
        ownIdKey: 'attachment_ids',
        ownKey: 'attachments',
        foreignViewModel: ViewMediafile
    }
];

const UserRelations: RelationDefinition[] = [
    {
        type: 'M2M',
        ownIdKey: 'groups_id',
        ownKey: 'groups',
        foreignViewModel: ViewGroup
    }
];
*/
