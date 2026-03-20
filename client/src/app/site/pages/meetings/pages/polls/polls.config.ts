import { Ballot } from 'src/app/domain/models/poll/ballot';
import { Option } from 'src/app/domain/models/poll/option';
import { Poll } from 'src/app/domain/models/poll/poll';
import { PollConfigApproval } from 'src/app/domain/models/poll/poll-config-approval';
import { PollOption } from 'src/app/domain/models/poll/poll-option';
import { PollConfigRatingApproval } from 'src/app/domain/models/poll/poll-config-rating-approval';
import { PollConfigRatingScore } from 'src/app/domain/models/poll/poll-config-rating-score';
import { PollConfigSelection } from 'src/app/domain/models/poll/poll-config-selection';
import { PollConfigStvScottish } from 'src/app/domain/models/poll/poll-config-stv-scottish';
import { PollCandidate } from 'src/app/domain/models/poll-candidate-lists/poll-candidate';
import { PollCandidateList } from 'src/app/domain/models/poll-candidate-lists/poll-candidate-list';
import { PollCandidateRepositoryService } from 'src/app/gateways/repositories/poll-candidate-lists/poll-candidate';
import { PollCandidateListRepositoryService } from 'src/app/gateways/repositories/poll-candidate-lists/poll-candidate-list';
import { BallotRepositoryService } from 'src/app/gateways/repositories/polls/ballot-repository.service';
import { OptionRepositoryService } from 'src/app/gateways/repositories/polls/option-repository.service';
import { PollConfigApprovalRepositoryService } from 'src/app/gateways/repositories/polls/poll-config-approval-repository.service';
import { PollOptionRepositoryService } from 'src/app/gateways/repositories/polls/poll-option-repository.service';
import { PollConfigRatingApprovalRepositoryService } from 'src/app/gateways/repositories/polls/poll-config-rating-approval-repository.service';
import { PollConfigRatingScoreRepositoryService } from 'src/app/gateways/repositories/polls/poll-config-rating-score-repository.service';
import { PollConfigSelectionRepositoryService } from 'src/app/gateways/repositories/polls/poll-config-selection-repository.service';
import { PollConfigStvScottishRepositoryService } from 'src/app/gateways/repositories/polls/poll-config-stv-scottish-repository.service';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';

import { AppConfig } from '../../../../../infrastructure/definitions/app-config';
import {
    ViewBallot,
    ViewOption,
    ViewPoll,
    ViewPollConfigApproval,
    ViewPollOption,
    ViewPollConfigRatingApproval,
    ViewPollConfigRatingScore,
    ViewPollConfigSelection,
    ViewPollConfigStvScottish
} from './view-models';
import { ViewPollCandidate } from './view-models/view-poll-candidate';
import { ViewPollCandidateList } from './view-models/view-poll-candidate-list';

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
            model: Option,
            viewModel: ViewOption,
            repository: OptionRepositoryService
        },
        {
            model: Ballot,
            viewModel: ViewBallot,
            repository: BallotRepositoryService
        },
        {
            model: PollCandidate,
            viewModel: ViewPollCandidate,
            repository: PollCandidateRepositoryService
        },
        {
            model: PollCandidateList,
            viewModel: ViewPollCandidateList,
            repository: PollCandidateListRepositoryService
        }
    ]
};
