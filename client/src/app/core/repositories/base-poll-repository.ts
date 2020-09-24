import { HttpService } from 'app/core/core-services/http.service';
import { RepositoryServiceCollector } from 'app/core/repositories/repository-service-collector';
import { VotingService } from 'app/core/ui-services/voting.service';
import { ModelConstructor } from 'app/shared/models/base/base-model';
import { BasePoll, PollState } from 'app/shared/models/poll/base-poll';
import { BaseRepositoryWithActiveMeeting } from './base-repository-with-active-meeting';
import { BaseViewPoll } from '../../site/polls/models/base-view-poll';

export type PollMethodYNA = 'Y' | 'N' | 'A';
export type PollMethodYN = 'Y' | 'N';

export abstract class BasePollRepository<
    V extends BaseViewPoll = any,
    M extends BasePoll = any
> extends BaseRepositoryWithActiveMeeting<V, M> {
    // just passing everything to superclass
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        protected baseModelCtor: ModelConstructor<M>,
        private votingService: VotingService,
        protected http: HttpService
    ) {
        super(repositoryServiceCollector, baseModelCtor);
    }

    /**
     * overwrites the view model creation to insert the `canBeVotedFor` property
     * @param model the model
     */
    protected createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.canBeVotedFor = () => this.votingService.canVote(viewModel);
        return viewModel;
    }

    public async changePollState(poll: BasePoll): Promise<void> {
        const path = this.restPath(poll);
        switch (poll.state) {
            case PollState.Created:
            // return this.http.post(`${path}/start/`);
            case PollState.Started:
            // return this.http.post(`${path}/stop/`);
            case PollState.Finished:
            // return this.http.post(`${path}/publish/`);
            case PollState.Published:
            // return this.resetPoll(poll);
        }
    }

    private restPath(poll: BasePoll): string {
        return `/rest/${poll.collection}/${poll.id}`;
    }

    public async resetPoll(poll: BasePoll): Promise<void> {
        // return this.http.post(`${this.restPath(poll)}/reset/`);
    }

    public async pseudoanonymize(poll: BasePoll): Promise<void> {
        // return this.http.post(`${this.restPath(poll)}/pseudoanonymize/`);
    }

    public async refresh(poll: BasePoll): Promise<void> {
        // return this.http.post(`${this.restPath(poll)}/refresh/`);
    }
}
