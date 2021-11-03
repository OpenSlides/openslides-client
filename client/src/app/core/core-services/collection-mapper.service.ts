import { Injectable } from '@angular/core';
import { BaseRepository } from 'app/core/repositories/base-repository';
import { BaseViewModel, ViewModelConstructor } from 'app/site/base/base-view-model';

import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { BaseRepositoryWithActiveMeeting } from '../repositories/base-repository-with-active-meeting';

/**
 * Unifies the ModelConstructor and ViewModelConstructor.
 */
interface UnifiedConstructors {
    COLLECTION: string;
    new (...args: any[]): any;
}

/**
 * Every types supported: (View)ModelConstructors, repos and collections.
 */
type CollectionType = UnifiedConstructors | BaseRepository<any, any> | string;

type CollectionMappedTypes = [
    ModelConstructor<BaseModel>,
    ViewModelConstructor<BaseViewModel>,
    BaseRepository<BaseViewModel<any>, BaseModel<any>>
];

/**
 * Registeres the mapping between collection strings, models constructors, view
 * model constructors and repositories.
 * All models need to be registered!
 */
@Injectable({
    providedIn: `root`
})
export class CollectionMapperService {
    /**
     * Maps collection strings to mapping entries
     */
    private collectionMapping: {
        [collection: string]: CollectionMappedTypes;
    } = {};

    public constructor() {}

    /**
     * Registers the combination of a collection string, model, view model and repository
     * @param collection
     * @param model
     */
    public registerCollectionElement<V extends BaseViewModel<M>, M extends BaseModel>(
        model: ModelConstructor<M>,
        viewModel: ViewModelConstructor<V>,
        repository: BaseRepository<V, M>
    ): void {
        this.collectionMapping[model.COLLECTION] = [model, viewModel, repository];
    }

    /**
     * @param obj The object to get the collection string from.
     * @returns the collection
     */
    public getCollection(obj: CollectionType): string {
        if (typeof obj === `string`) {
            return obj;
        } else {
            return obj.COLLECTION;
        }
    }

    /**
     * @returns true, if the given collection is known by this service.
     */
    public isCollectionRegistered(collection: string): boolean {
        return !!this.collectionMapping[collection];
    }

    /**
     * @param obj The object to get the model constructor from.
     * @returns the model constructor
     */
    public getModelConstructor<M extends BaseModel>(obj: CollectionType): ModelConstructor<M> | null {
        if (this.isCollectionRegistered(this.getCollection(obj))) {
            return this.collectionMapping[this.getCollection(obj)][0] as ModelConstructor<M>;
        }
    }

    /**
     * @param obj The object to get the view model constructor from.
     * @returns the view model constructor
     */
    public getViewModelConstructor<M extends BaseViewModel>(obj: CollectionType): ViewModelConstructor<M> | null {
        if (this.isCollectionRegistered(this.getCollection(obj))) {
            return this.collectionMapping[this.getCollection(obj)][1] as ViewModelConstructor<M>;
        }
    }

    /**
     * @param obj The object to get the repository from.
     * @returns the repository
     */
    public getRepository<V extends BaseViewModel, M extends BaseModel>(
        obj: CollectionType
    ): BaseRepository<V, M> | null {
        if (this.isCollectionRegistered(this.getCollection(obj))) {
            return this.collectionMapping[this.getCollection(obj)][2] as BaseRepository<V, M>;
        }
    }

    /**
     * @returns all registered repositories.
     */
    public getAllRepositories(): BaseRepository<any, any>[] {
        return Object.values(this.collectionMapping).map((types: CollectionMappedTypes) => types[2]);
    }

    public isMeetingSpecificCollection(obj: CollectionType): boolean {
        const repo = this.getRepository(obj);
        if (!repo) {
            return false;
        }
        return repo instanceof BaseRepositoryWithActiveMeeting;
    }
}
