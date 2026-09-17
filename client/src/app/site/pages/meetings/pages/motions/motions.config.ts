import { Permission } from '@app/domain/definitions/permission';
import { Motion } from '@app/domain/models/motions/motion';
import { MotionBlock } from '@app/domain/models/motions/motion-block';
import { MotionCategory } from '@app/domain/models/motions/motion-category';
import { MotionChangeRecommendation } from '@app/domain/models/motions/motion-change-recommendation';
import { MotionComment } from '@app/domain/models/motions/motion-comment';
import { MotionCommentSection } from '@app/domain/models/motions/motion-comment-section';
import { MotionEditor } from '@app/domain/models/motions/motion-editor';
import { MotionState } from '@app/domain/models/motions/motion-state';
import { MotionSubmitter } from '@app/domain/models/motions/motion-submitter';
import { MotionSupporter } from '@app/domain/models/motions/motion-supporter';
import { MotionWorkflow } from '@app/domain/models/motions/motion-workflow';
import { MotionWorkingGroupSpeaker } from '@app/domain/models/motions/motion-working-group-speaker';
import { PersonalNote } from '@app/domain/models/motions/personal-note';
import { Tag } from '@app/domain/models/tag/tag';
import { MotionBlockRepositoryService } from '@app/gateways/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from '@app/gateways/repositories/motions/motion-category-repository.service';
import { MotionChangeRecommendationRepositoryService } from '@app/gateways/repositories/motions/motion-change-recommendation-repository.service';
import {
    MotionCommentRepositoryService,
    MotionCommentSectionRepositoryService
} from '@app/gateways/repositories/motions/motion-comments';
import { MotionEditorRepositoryService } from '@app/gateways/repositories/motions/motion-editor-repository';
import { MotionRepositoryService } from '@app/gateways/repositories/motions/motion-repository.service';
import { MotionStateRepositoryService } from '@app/gateways/repositories/motions/motion-state-repository.service';
import { MotionSubmitterRepositoryService } from '@app/gateways/repositories/motions/motion-submitter-repository.service';
import { MotionSupporterRepositoryService } from '@app/gateways/repositories/motions/motion-supporter';
import { MotionWorkflowRepositoryService } from '@app/gateways/repositories/motions/motion-workflow-repository.service';
import { MotionWorkingGroupSpeakerRepositoryService } from '@app/gateways/repositories/motions/motion-working-group-speaker-repository';
import { PersonalNoteRepositoryService } from '@app/gateways/repositories/motions/personal-note-repository.service';
import { TagRepositoryService } from '@app/gateways/repositories/tags';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

import { ViewMotionCategory } from './modules/categories/view-models/view-motion-category';
import { ViewMotionChangeRecommendation } from './modules/change-recommendations/view-models/view-motion-change-recommendation';
import { ViewMotionComment } from './modules/comments/view-models/view-motion-comment';
import { ViewMotionCommentSection } from './modules/comments/view-models/view-motion-comment-section';
import { ViewMotionEditor } from './modules/editors/view-models/view-motion-editor';
import { ViewMotionBlock } from './modules/motion-blocks/view-models/view-motion-block';
import { ViewPersonalNote } from './modules/personal-notes/view-models/view-personal-note';
import { ViewMotionState } from './modules/states/view-models/view-motion-state';
import { ViewMotionSubmitter } from './modules/submitters/view-models/view-motion-submitter';
import { ViewMotionSupporter } from './modules/supporters/view-models/view-motion-supporter';
import { ViewTag } from './modules/tags/view-models/view-tag';
import { ViewMotionWorkflow } from './modules/workflows/view-models/view-motion-workflow';
import { ViewMotionWorkingGroupSpeaker } from './modules/working-group-speakers/view-models/view-motion-working-group-speaker';
import { ViewMotion } from './view-models/view-motion';

export const MotionsAppConfig: AppConfig = {
    name: `motions`,
    models: [
        {
            model: Motion,
            viewModel: ViewMotion,
            repository: MotionRepositoryService
        },
        {
            model: MotionSubmitter,
            viewModel: ViewMotionSubmitter,
            repository: MotionSubmitterRepositoryService
        },
        {
            model: MotionSupporter,
            viewModel: ViewMotionSupporter,
            repository: MotionSupporterRepositoryService
        },
        {
            model: MotionEditor,
            viewModel: ViewMotionEditor,
            repository: MotionEditorRepositoryService
        },
        {
            model: MotionWorkingGroupSpeaker,
            viewModel: ViewMotionWorkingGroupSpeaker,
            repository: MotionWorkingGroupSpeakerRepositoryService
        },
        {
            model: MotionComment,
            viewModel: ViewMotionComment,
            repository: MotionCommentRepositoryService
        },
        {
            model: MotionCategory,
            viewModel: ViewMotionCategory,
            repository: MotionCategoryRepositoryService
        },
        {
            model: MotionWorkflow,
            viewModel: ViewMotionWorkflow,
            repository: MotionWorkflowRepositoryService
        },
        {
            model: MotionState,
            viewModel: ViewMotionState,
            repository: MotionStateRepositoryService
        },
        {
            model: MotionCommentSection,
            viewModel: ViewMotionCommentSection,
            repository: MotionCommentSectionRepositoryService
        },
        {
            model: MotionChangeRecommendation,
            viewModel: ViewMotionChangeRecommendation,
            repository: MotionChangeRecommendationRepositoryService
        },
        {
            model: MotionBlock,
            viewModel: ViewMotionBlock,
            repository: MotionBlockRepositoryService
        },
        {
            model: Tag,
            viewModel: ViewTag,
            repository: TagRepositoryService
        },
        {
            model: PersonalNote,
            viewModel: ViewPersonalNote,
            repository: PersonalNoteRepositoryService
        }
    ],
    meetingMenuMentries: [
        {
            route: `motions`,
            displayName: `Motions`,
            icon: `assignment`,
            weight: 300,
            permission: Permission.motionCanSee
        }
    ]
};
