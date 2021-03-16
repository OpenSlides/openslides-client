import { AppConfig } from 'app/core/definitions/app-config';
import { OptionRepositoryService } from 'app/core/repositories/polls/option-repository.service';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from 'app/core/repositories/polls/vote-repository.service';
import { Option } from 'app/shared/models/poll/option';
import { Poll } from 'app/shared/models/poll/poll';
import { ViewOption } from 'app/shared/models/poll/view-option';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewVote } from 'app/shared/models/poll/view-vote';
import { Vote } from 'app/shared/models/poll/vote';

export const PollsAppConfig: AppConfig = {
    name: 'poll',
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
