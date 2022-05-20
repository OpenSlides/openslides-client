import { Option } from 'src/app/domain/models/poll/option';
import { Poll } from 'src/app/domain/models/poll/poll';
import { Vote } from 'src/app/domain/models/poll/vote';
import { OptionRepositoryService } from 'src/app/gateways/repositories/polls/option-repository.service';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from 'src/app/gateways/repositories/polls/vote-repository.service';

import { AppConfig } from '../../../../../infrastructure/definitions/app-config';
import { ViewOption, ViewPoll, ViewVote } from './view-models';
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
        }
    ]
};
