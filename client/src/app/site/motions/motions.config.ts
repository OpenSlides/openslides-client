import { AppConfig } from '../../core/definitions/app-config';
import { Permission } from 'app/core/core-services/permission';
import { MotionBlockRepositoryService } from 'app/core/repositories/motions/motion-block-repository.service';
import { MotionCategoryRepositoryService } from 'app/core/repositories/motions/motion-category-repository.service';
import { MotionChangeRecommendationRepositoryService } from 'app/core/repositories/motions/motion-change-recommendation-repository.service';
import { MotionCommentRepositoryService } from 'app/core/repositories/motions/motion-comment-repository.service';
import { MotionCommentSectionRepositoryService } from 'app/core/repositories/motions/motion-comment-section-repository.service';
import { MotionOptionRepositoryService } from 'app/core/repositories/motions/motion-option-repository.service';
import { MotionPollRepositoryService } from 'app/core/repositories/motions/motion-poll-repository.service';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { MotionStateRepositoryService } from 'app/core/repositories/motions/motion-state-repository.service';
import { MotionStatuteParagraphRepositoryService } from 'app/core/repositories/motions/motion-statute-paragraph-repository.service';
import { MotionSubmitterRepositoryService } from 'app/core/repositories/motions/motion-submitter-repository.service';
import { MotionVoteRepositoryService } from 'app/core/repositories/motions/motion-vote-repository.service';
import { MotionWorkflowRepositoryService } from 'app/core/repositories/motions/motion-workflow-repository.service';
import { MotionComment } from 'app/shared/models/motions/motion-comment';
import { MotionOption } from 'app/shared/models/motions/motion-option';
import { MotionPoll } from 'app/shared/models/motions/motion-poll';
import { MotionState } from 'app/shared/models/motions/motion-state';
import { MotionSubmitter } from 'app/shared/models/motions/motion-submitter';
import { MotionVote } from 'app/shared/models/motions/motion-vote';
import { Motion } from '../../shared/models/motions/motion';
import { MotionBlock } from '../../shared/models/motions/motion-block';
import { MotionCategory } from '../../shared/models/motions/motion-category';
import { MotionChangeRecommendation } from '../../shared/models/motions/motion-change-recommendation';
import { MotionCommentSection } from '../../shared/models/motions/motion-comment-section';
import { MotionStatuteParagraph } from '../../shared/models/motions/motion-statute-paragraph';
import { MotionWorkflow } from '../../shared/models/motions/motion-workflow';
import { ViewMotion } from './models/view-motion';
import { ViewMotionBlock } from './models/view-motion-block';
import { ViewMotionCategory } from './models/view-motion-category';
import { ViewMotionChangeRecommendation } from './models/view-motion-change-recommendation';
import { ViewMotionComment } from './models/view-motion-comment';
import { ViewMotionCommentSection } from './models/view-motion-comment-section';
import { ViewMotionOption } from './models/view-motion-option';
import { ViewMotionPoll } from './models/view-motion-poll';
import { ViewMotionState } from './models/view-motion-state';
import { ViewMotionStatuteParagraph } from './models/view-motion-statute-paragraph';
import { ViewMotionSubmitter } from './models/view-motion-submitter';
import { ViewMotionVote } from './models/view-motion-vote';
import { ViewMotionWorkflow } from './models/view-motion-workflow';

export const MotionsAppConfig: AppConfig = {
    name: 'motions',
    models: [
        {
            model: Motion,
            viewModel: ViewMotion,
            searchOrder: 2,
            repository: MotionRepositoryService
        },
        {
            model: MotionSubmitter,
            viewModel: ViewMotionSubmitter,
            repository: MotionSubmitterRepositoryService
        },
        {
            model: MotionComment,
            viewModel: ViewMotionComment,
            repository: MotionCommentRepositoryService
        },
        {
            model: MotionCategory,
            viewModel: ViewMotionCategory,
            searchOrder: 6,
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
            searchOrder: 7,
            repository: MotionBlockRepositoryService
        },
        {
            model: MotionStatuteParagraph,
            viewModel: ViewMotionStatuteParagraph,
            searchOrder: 9,
            repository: MotionStatuteParagraphRepositoryService
        },
        { model: MotionPoll, viewModel: ViewMotionPoll, repository: MotionPollRepositoryService },
        { model: MotionOption, viewModel: ViewMotionOption, repository: MotionOptionRepositoryService },
        { model: MotionVote, viewModel: ViewMotionVote, repository: MotionVoteRepositoryService }
    ],
    mainMenuEntries: [
        {
            route: '/motions',
            displayName: 'Motions',
            icon: 'assignment',
            weight: 300,
            permission: Permission.motionsCanSee
        }
    ]
};
