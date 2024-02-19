import { Permission } from 'src/app/domain/definitions/permission';
import { Motion } from 'src/app/domain/models/motions/motion';
import { MotionBlock } from 'src/app/domain/models/motions/motion-block';
import { MotionCategory } from 'src/app/domain/models/motions/motion-category';
import { MotionChangeRecommendation } from 'src/app/domain/models/motions/motion-change-recommendation';
import { MotionComment } from 'src/app/domain/models/motions/motion-comment';
import { MotionCommentSection } from 'src/app/domain/models/motions/motion-comment-section';
import { MotionEditor } from 'src/app/domain/models/motions/motion-editor';
import { MotionState } from 'src/app/domain/models/motions/motion-state';
import { MotionStatuteParagraph } from 'src/app/domain/models/motions/motion-statute-paragraph';
import { MotionSubmitter } from 'src/app/domain/models/motions/motion-submitter';
import { MotionWorkflow } from 'src/app/domain/models/motions/motion-workflow';
import { MotionWorkingGroupSpeaker } from 'src/app/domain/models/motions/motion-working-group-speaker';
import { PersonalNote } from 'src/app/domain/models/motions/personal-note';
import { Tag } from 'src/app/domain/models/tag/tag';
import {
    MotionBlockRepositoryService,
    MotionCategoryRepositoryService,
    MotionChangeRecommendationRepositoryService,
    MotionCommentRepositoryService,
    MotionCommentSectionRepositoryService,
    MotionEditorRepositoryService,
    MotionRepositoryService,
    MotionStateRepositoryService,
    MotionStatuteParagraphRepositoryService,
    MotionSubmitterRepositoryService,
    MotionWorkflowRepositoryService,
    MotionWorkingGroupSpeakerRepositoryService
} from 'src/app/gateways/repositories/motions';
import { PersonalNoteRepositoryService } from 'src/app/gateways/repositories/motions/personal-note-repository.service';
import { TagRepositoryService } from 'src/app/gateways/repositories/tags';
import { AppConfig } from 'src/app/infrastructure/definitions/app-config';

import {
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
} from './modules';
import { ViewMotionEditor } from './modules/editors';
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
            model: MotionStatuteParagraph,
            viewModel: ViewMotionStatuteParagraph,
            repository: MotionStatuteParagraphRepositoryService
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
