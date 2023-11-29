import { HasListOfSpeakersId } from 'src/app/domain/interfaces';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { BaseViewModel } from 'src/app/site/base/base-view-model';
import { HasListOfSpeakers } from 'src/app/site/pages/meetings/pages/agenda';

import { BaseMeetingRelatedRepository } from './base-meeting-related-repository';
import { RepositoryMeetingServiceCollectorService } from './repository-meeting-service-collector.service';

/**
 * Describes a base repository which objects have a list of speakers assigned.
 */
export interface ListOfSpeakersContentObjectRepository<
    V extends BaseViewModel & HasListOfSpeakers,
    M extends BaseModel & HasListOfSpeakersId
> extends BaseMeetingRelatedRepository<V, M> {
    getListOfSpeakersTitle: (viewModel: V) => string;
    getListOfSpeakersSlideTitle: (viewModel: V) => string;
}

/**
 * The base repository for objects with a list of speakers.
 */
export abstract class BaseListOfSpeakersContentObjectRepository<
        V extends BaseViewModel & HasListOfSpeakers,
        M extends BaseModel & HasListOfSpeakersId
    >
    extends BaseMeetingRelatedRepository<V, M>
    implements ListOfSpeakersContentObjectRepository<V, M>
{
    public constructor(
        repositoryServiceCollector: RepositoryMeetingServiceCollectorService,
        baseModelCtor: ModelConstructor<M>
    ) {
        super(repositoryServiceCollector, baseModelCtor);
    }

    public getListOfSpeakersTitle(viewModel: V): string {
        return this.getTitle(viewModel) + ` (` + this.getVerboseName() + `)`;
    }

    public getListOfSpeakersSlideTitle(viewModel: V): string {
        return this.getTitle(viewModel);
    }

    /**
     * Adds the list of speakers titles to the view model
     */
    protected override createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.getListOfSpeakersTitle = () => this.getListOfSpeakersTitle(viewModel);
        viewModel.getListOfSpeakersSlideTitle = () => this.getListOfSpeakersSlideTitle(viewModel);
        return viewModel;
    }
}
