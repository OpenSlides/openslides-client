import { Option } from 'src/app/domain/models/poll/option';
import { Poll } from 'src/app/domain/models/poll/poll';
import { Vote } from 'src/app/domain/models/poll/vote';
import { PollCandidate } from 'src/app/domain/models/poll-candidate-lists/poll-candidate';
import { PollCandidateList } from 'src/app/domain/models/poll-candidate-lists/poll-candidate-list';
import { PollCandidateRepositoryService } from 'src/app/gateways/repositories/poll-candidate-lists/poll-candidate';
import { PollCandidateListRepositoryService } from 'src/app/gateways/repositories/poll-candidate-lists/poll-candidate-list';
import { OptionRepositoryService } from 'src/app/gateways/repositories/polls/option-repository.service';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from 'src/app/gateways/repositories/polls/vote-repository.service';

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
