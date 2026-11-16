import { Poll } from '@app/domain/models/poll/poll';
import { PollBallot } from '@app/domain/models/poll/poll-ballot';
import { PollBallotUser } from '@app/domain/models/poll/poll-ballot-user';
import { PollConfigApproval } from '@app/domain/models/poll/poll-config-approval';
import { PollConfigRatingApproval } from '@app/domain/models/poll/poll-config-rating-approval';
import { PollConfigRatingScore } from '@app/domain/models/poll/poll-config-rating-score';
import { PollConfigSelection } from '@app/domain/models/poll/poll-config-selection';
import { PollConfigStvScottish } from '@app/domain/models/poll/poll-config-stv-scottish';
import { PollEntitledUser } from '@app/domain/models/poll/poll-entitled-user';
import { PollOption } from '@app/domain/models/poll/poll-option';
import { PollBallotRepositoryService } from '@app/gateways/repositories/polls/poll-ballot-repository.service';
import { PollBallotUserRepositoryService } from '@app/gateways/repositories/polls/poll-ballot-user-repository.service';
import { PollConfigApprovalRepositoryService } from '@app/gateways/repositories/polls/poll-config-approval-repository.service';
import { PollConfigRatingApprovalRepositoryService } from '@app/gateways/repositories/polls/poll-config-rating-approval-repository.service';
import { PollConfigRatingScoreRepositoryService } from '@app/gateways/repositories/polls/poll-config-rating-score-repository.service';
import { PollConfigSelectionRepositoryService } from '@app/gateways/repositories/polls/poll-config-selection-repository.service';
import { PollConfigStvScottishRepositoryService } from '@app/gateways/repositories/polls/poll-config-stv-scottish-repository.service';
import { PollEntitledUserRepositoryService } from '@app/gateways/repositories/polls/poll-entitled-user-repository.service';
import { PollOptionRepositoryService } from '@app/gateways/repositories/polls/poll-option-repository.service';
import { PollRepositoryService } from '@app/gateways/repositories/polls/poll-repository.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';

import { AppConfig } from '../../../../../infrastructure/definitions/app-config';
import { ViewPollBallot } from './view-models/poll-ballot';
import { ViewPollBallotUser } from './view-models/poll-ballot-user';
import { ViewPollConfigApproval } from './view-models/poll-config-approval';
import { ViewPollConfigRatingApproval } from './view-models/poll-config-rating-approval';
import { ViewPollConfigRatingScore } from './view-models/poll-config-rating-score';
import { ViewPollConfigSelection } from './view-models/poll-config-selection';
import { ViewPollConfigStvScottish } from './view-models/poll-config-stv-scottish';
import { ViewPollEntitledUser } from './view-models/poll-entitled-user';
import { ViewPollOption } from './view-models/poll-option';

export const PollsAppConfig: AppConfig = {
    name: `poll`,
    models: [
        {
            model: Poll,
            viewModel: ViewPoll,
            repository: PollRepositoryService
        },
        {
            model: PollConfigApproval,
            viewModel: ViewPollConfigApproval,
            repository: PollConfigApprovalRepositoryService
        },
        {
            model: PollConfigSelection,
            viewModel: ViewPollConfigSelection,
            repository: PollConfigSelectionRepositoryService
        },
        {
            model: PollConfigRatingApproval,
            viewModel: ViewPollConfigRatingApproval,
            repository: PollConfigRatingApprovalRepositoryService
        },
        {
            model: PollConfigRatingScore,
            viewModel: ViewPollConfigRatingScore,
            repository: PollConfigRatingScoreRepositoryService
        },
        {
            model: PollConfigSelection,
            viewModel: ViewPollConfigSelection,
            repository: PollConfigSelectionRepositoryService
        },
        {
            model: PollConfigStvScottish,
            viewModel: ViewPollConfigStvScottish,
            repository: PollConfigStvScottishRepositoryService
        },
        {
            model: PollEntitledUser,
            viewModel: ViewPollEntitledUser,
            repository: PollEntitledUserRepositoryService
        },
        {
            model: PollOption,
            viewModel: ViewPollOption,
            repository: PollOptionRepositoryService
        },
        {
            model: PollBallot,
            viewModel: ViewPollBallot,
            repository: PollBallotRepositoryService
        },
        {
            model: PollBallotUser,
            viewModel: ViewPollBallotUser,
            repository: PollBallotUserRepositoryService
        }
    ]
};
