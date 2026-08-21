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
import {
    MotionBlockRepositoryService,
    MotionCategoryRepositoryService,
    MotionChangeRecommendationRepositoryService,
    MotionCommentRepositoryService,
    MotionCommentSectionRepositoryService,
    MotionEditorRepositoryService,
    MotionRepositoryService,
    MotionStateRepositoryService,
    MotionSubmitterRepositoryService,
    MotionWorkflowRepositoryService,
    MotionWorkingGroupSpeakerRepositoryService
} from '@app/gateways/repositories/motions';
import { MotionSupporterRepositoryService } from '@app/gateways/repositories/motions/motion-supporter';
import { PersonalNoteRepositoryService } from '@app/gateways/repositories/motions/personal-note-repository.service';
import { TagRepositoryService } from '@app/gateways/repositories/tags';
import { AppConfig } from '@app/infrastructure/definitions/app-config';

import {
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
} from './modules';
import { ViewMotionEditor } from './modules/editors';
import { ViewMotionSupporter } from './modules/supporters';
import { ViewMotionWorkingGroupSpeaker } from './modules/working-group-speakers';
import { ViewMotion } from './view-models';

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
