import { Poll } from '@app/domain/models/poll/poll';
import { PollBallot } from '@app/domain/models/poll/poll-ballot';
import { PollConfigApproval } from '@app/domain/models/poll/poll-config-approval';
import { PollConfigRatingApproval } from '@app/domain/models/poll/poll-config-rating-approval';
import { PollConfigRatingScore } from '@app/domain/models/poll/poll-config-rating-score';
import { PollConfigSelection } from '@app/domain/models/poll/poll-config-selection';
import { PollConfigStvScottish } from '@app/domain/models/poll/poll-config-stv-scottish';
import { PollOption } from '@app/domain/models/poll/poll-option';
import { PollBallotRepositoryService } from '@app/gateways/repositories/polls/poll-ballot-repository.service';
import { PollConfigApprovalRepositoryService } from '@app/gateways/repositories/polls/poll-config-approval-repository.service';
import { PollConfigRatingApprovalRepositoryService } from '@app/gateways/repositories/polls/poll-config-rating-approval-repository.service';
import { PollConfigRatingScoreRepositoryService } from '@app/gateways/repositories/polls/poll-config-rating-score-repository.service';
import { PollConfigSelectionRepositoryService } from '@app/gateways/repositories/polls/poll-config-selection-repository.service';
import { PollConfigStvScottishRepositoryService } from '@app/gateways/repositories/polls/poll-config-stv-scottish-repository.service';
import { PollOptionRepositoryService } from '@app/gateways/repositories/polls/poll-option-repository.service';
import { PollRepositoryService } from '@app/gateways/repositories/polls/poll-repository.service';

import { AppConfig } from '../../../../../infrastructure/definitions/app-config';
import {
    ViewPoll,
    ViewPollBallot,
    ViewPollConfigApproval,
    ViewPollConfigRatingApproval,
    ViewPollConfigRatingScore,
    ViewPollConfigSelection,
    ViewPollConfigStvScottish,
    ViewPollOption
} from './view-models';

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
            model: PollOption,
            viewModel: ViewPollOption,
            repository: PollOptionRepositoryService
        },
        {
            model: PollBallot,
            viewModel: ViewPollBallot,
            repository: PollBallotRepositoryService
        }
    ]
};
