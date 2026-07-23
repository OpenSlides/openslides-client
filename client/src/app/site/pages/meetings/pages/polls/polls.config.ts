import { Option } from '@app/domain/models/poll/option';
import { Poll } from '@app/domain/models/poll/poll';
import { Vote } from '@app/domain/models/poll/vote';
import { PollCandidate } from '@app/domain/models/poll-candidate-lists/poll-candidate';
import { PollCandidateList } from '@app/domain/models/poll-candidate-lists/poll-candidate-list';
import { PollCandidateRepositoryService } from '@app/gateways/repositories/poll-candidate-lists/poll-candidate';
import { PollCandidateListRepositoryService } from '@app/gateways/repositories/poll-candidate-lists/poll-candidate-list';
import { OptionRepositoryService } from '@app/gateways/repositories/polls/option-repository.service';
import { PollRepositoryService } from '@app/gateways/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from '@app/gateways/repositories/polls/vote-repository.service';

import { AppConfig } from '../../../../../infrastructure/definitions/app-config';
import { ViewOption, ViewPoll, ViewVote } from './view-models';
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
            model: Option,
            viewModel: ViewOption,
            repository: OptionRepositoryService
        },
        {
            model: Vote,
            viewModel: ViewVote,
            repository: VoteRepositoryService
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
