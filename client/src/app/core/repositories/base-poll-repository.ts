import { HttpService } from 'app/core/core-services/http.service';
import { RelationDefinition } from 'app/core/definitions/relations';
import { BaseRepository, NestedModelDescriptors } from 'app/core/repositories/base-repository';
import { RepositoryServiceCollector } from 'app/core/repositories/repository-service-collector';
import { VotingService } from 'app/core/ui-services/voting.service';
import { ModelConstructor } from 'app/shared/models/base/base-model';
import { BasePoll, PollState } from 'app/shared/models/poll/base-poll';
import { BaseViewModel, TitleInformation } from 'app/site/base/base-view-model';
import { ViewBasePoll } from '../../site/polls/models/view-base-poll';

export abstract class BasePollRepository<
    V extends ViewBasePoll & T = any,
    M extends BasePoll = any,
    T extends TitleInformation = any
> extends BaseRepository<V, M, T> {
    // just passing everything to superclass
    public constructor(
        repositoryServiceCollector: RepositoryServiceCollector,
        protected baseModelCtor: ModelConstructor<M>,
        protected relationDefinitions: RelationDefinition<BaseViewModel>[] = [],
        protected nestedModelDescriptors: NestedModelDescriptors = {},
        private votingService: VotingService,
        protected http: HttpService
    ) {
        super(repositoryServiceCollector, baseModelCtor, relationDefinitions, nestedModelDescriptors);
    }

    /**
     * overwrites the view model creation to insert the `canBeVotedFor` property
     * @param model the model
     */
    protected createViewModelWithTitles(model: M): V {
        const viewModel = super.createViewModelWithTitles(model);
        viewModel.canBeVotedFor = () => this.votingService.canVote(viewModel);
        return viewModel;
    }

    public changePollState(poll: BasePoll): Promise<void> {
        const path = this.restPath(poll);
        switch (poll.state) {
            case PollState.Created:
                return this.http.post(`${path}/start/`);
            case PollState.Started:
                return this.http.post(`${path}/stop/`);
            case PollState.Finished:
                return this.http.post(`${path}/publish/`);
            case PollState.Published:
                return this.resetPoll(poll);
        }
    }

    public resetPoll(poll: BasePoll): Promise<void> {
        return this.http.post(`${this.restPath(poll)}/reset/`);
    }

    private restPath(poll: BasePoll): string {
        return `/rest/${poll.collection}/${poll.id}`;
    }

    public pseudoanonymize(poll: BasePoll): Promise<void> {
        const path = this.restPath(poll);
        return this.http.post(`${path}/pseudoanonymize/`);
    }
}
