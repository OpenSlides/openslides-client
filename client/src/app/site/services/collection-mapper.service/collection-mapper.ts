import { BaseViewModel, ViewModelConstructor } from 'src/app/site/base/base-view-model';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { CollectionType } from './definitions';
import { Collection } from 'src/app/domain/definitions/key-types';
export interface CollectionMapper {
    registerCollectionElement<V extends BaseViewModel<M>, M extends BaseModel>(
        modelConstructor: ModelConstructor<M>,
        viewModelConstructor: ViewModelConstructor<V>,
        repository: BaseRepository<V, M>
    ): void;

    getCollection(instance: CollectionType): Collection;

    isCollectionRegistered(collection: Collection): boolean;

    getModelConstructor<M extends BaseModel>(instance: CollectionType): ModelConstructor<M> | null;

    getViewModelConstructor<V extends BaseViewModel>(instance: CollectionType): ViewModelConstructor<V> | null;

    getRepository<V extends BaseViewModel<M>, M extends BaseModel>(
        instance: CollectionType
    ): BaseRepository<V, M> | null;

    getAllRepositories(): BaseRepository<any, any>[];
}
