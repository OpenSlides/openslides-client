import { BaseViewModelWithListOfSpeakers } from 'app/site/base/base-view-model-with-list-of-speakers';
import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { BaseRepository } from './base-repository';
import { TitleInformation } from '../../site/base/base-view-model';
import { RepositoryServiceCollector } from './repository-service-collector';

export function isBaseIsListOfSpeakersContentObjectRepository(
    obj: any
): obj is BaseIsListOfSpeakersContentObjectRepository<any, any, any> {
    const repo = obj as BaseIsListOfSpeakersContentObjectRepository<any, any, any>;
    return !!obj && repo.getListOfSpeakersTitle !== undefined && repo.getListOfSpeakersSlideTitle !== undefined;
}

/**
 * Describes a base repository which objects have a list of speakers assigned.
 */
export interface IBaseIsListOfSpeakersContentObjectRepository<
    V extends BaseViewModelWithListOfSpeakers & T,
    M extends BaseModel,
    T extends TitleInformation
> extends BaseRepository<V, M, T> {
    getListOfSpeakersTitle: (titleInformation: T) => string;
    getListOfSpeakersSlideTitle: (titleInformation: T) => string;
}

/**
 * The base repository for objects with a list of speakers.
 */
export abstract class BaseIsListOfSpeakersContentObjectRepository<
    V extends BaseViewModelWithListOfSpeakers & T,
    M extends BaseModel,
    T extends TitleInformation
> extends BaseRepository<V, M, T> implements IBaseIsListOfSpeakersContentObjectRepository<V, M, T> {
    public constructor(repositoryServiceCollector: RepositoryServiceCollector, baseModelCtor: ModelConstructor<M>) {
        super(repositoryServiceCollector, baseModelCtor);
    }

    public getListOfSpeakersTitle(titleInformation: T): string {
        return this.getTitle(titleInformation) + ' (' + this.getVerboseName() + ')';
    }

    public getListOfSpeakersSlideTitle(titleInformation: T): string {
        return this.getTitle(titleInformation);
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
