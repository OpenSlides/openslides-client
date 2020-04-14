import { HasListOfSpeakersId } from 'app/shared/models/base/has-list-of-speakers-id';
import { HasListOfSpeakers } from 'app/site/agenda/models/view-list-of-speakers';
import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { BaseRepository } from './base-repository';
import { BaseViewModel } from '../../site/base/base-view-model';
import { RepositoryServiceCollector } from './repository-service-collector';

export function isBaseIsListOfSpeakersContentObjectRepository(
    obj: any
): obj is BaseIsListOfSpeakersContentObjectRepository<any, any> {
    const repo = obj as BaseIsListOfSpeakersContentObjectRepository<any, any>;
    return !!obj && repo.getListOfSpeakersTitle !== undefined && repo.getListOfSpeakersSlideTitle !== undefined;
}

/**
 * Describes a base repository which objects have a list of speakers assigned.
 */
export interface IBaseIsListOfSpeakersContentObjectRepository<
    V extends BaseViewModel & HasListOfSpeakers,
    M extends BaseModel & HasListOfSpeakersId
> extends BaseRepository<V, M> {
    getListOfSpeakersTitle: (viewModel: V) => string;
    getListOfSpeakersSlideTitle: (viewModel: V) => string;
}

/**
 * The base repository for objects with a list of speakers.
 */
export abstract class BaseIsListOfSpeakersContentObjectRepository<
    V extends BaseViewModel & HasListOfSpeakers,
    M extends BaseModel & HasListOfSpeakersId
> extends BaseRepository<V, M> implements IBaseIsListOfSpeakersContentObjectRepository<V, M> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector, baseModelCtor: ModelConstructor<M>) {
        super(repositoryServiceCollector, baseModelCtor);
    }

    public getListOfSpeakersTitle(viewModel: V): string {
        return this.getTitle(viewModel) + ' (' + this.getVerboseName() + ')';
    }

    public getListOfSpeakersSlideTitle(viewModel: V): string {
        return this.getTitle(viewModel);
    }

    /**
     * Adds the list of speakers titles to the view model
     */
    protected createViewModel(model: M): V {
        const viewModel = super.createViewModel(model);
        viewModel.getListOfSpeakersTitle = () => this.getListOfSpeakersTitle(viewModel);
        viewModel.getListOfSpeakersSlideTitle = () => this.getListOfSpeakersSlideTitle(viewModel);
        return viewModel;
    }
}
