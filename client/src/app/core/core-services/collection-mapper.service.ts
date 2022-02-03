import { Injectable } from '@angular/core';
import { BaseRepository } from 'app/core/repositories/base-repository';
import { BaseViewModel, ViewModelConstructor } from 'app/site/base/base-view-model';
import { BehaviorSubject, Observable } from 'rxjs';

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

interface CollectionMappedTypes {
    modelConstructor: ModelConstructor<BaseModel>;
    viewModelConstructor: ViewModelConstructor<BaseViewModel>;
    repository: BaseRepository<BaseViewModel, BaseModel>;
}

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
    private readonly _collectionMapping: {
        [collection: string]: CollectionMappedTypes;
    } = {};

    private readonly _repositoriesSubject = new BehaviorSubject<BaseRepository<BaseViewModel, BaseModel>[]>([]);

    /**
     * Registers the combination of a collection string, model, view model and repository
     * @param collection
     * @param modelConstructor
     */
    public registerCollectionElement<V extends BaseViewModel<M>, M extends BaseModel>(
        modelConstructor: ModelConstructor<M>,
        viewModelConstructor: ViewModelConstructor<V>,
        repository: BaseRepository<V, M>
    ): void {
        this._collectionMapping[modelConstructor.COLLECTION] = { modelConstructor, viewModelConstructor, repository };
        this._repositoriesSubject.next(this.getAllRepositories());
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
        return !!this._collectionMapping[collection];
    }

    /**
     * @param obj The object to get the model constructor from.
     * @returns the model constructor
     */
    public getModelConstructor<M extends BaseModel>(obj: CollectionType): ModelConstructor<M> | null {
        if (this.isCollectionRegistered(this.getCollection(obj))) {
            return this._collectionMapping[this.getCollection(obj)].modelConstructor as ModelConstructor<M>;
        }
    }

    /**
     * @param obj The object to get the view model constructor from.
     * @returns the view model constructor
     */
    public getViewModelConstructor<M extends BaseViewModel>(obj: CollectionType): ViewModelConstructor<M> | null {
        if (this.isCollectionRegistered(this.getCollection(obj))) {
            return this._collectionMapping[this.getCollection(obj)].viewModelConstructor as ViewModelConstructor<M>;
        }
    }

    /**
     * @param collectionType The object to get the repository from.
     * @returns the repository
     */
    public getRepository<V extends BaseViewModel, M extends BaseModel>(
        collectionType: CollectionType
    ): BaseRepository<V, M> | null {
        if (this.isCollectionRegistered(this.getCollection(collectionType))) {
            return this._collectionMapping[this.getCollection(collectionType)].repository as BaseRepository<V, M>;
        }
    }

    /**
     * @returns all registered repositories.
     */
    public getAllRepositories(): BaseRepository<any, any>[] {
        return Object.values(this._collectionMapping).map((types: CollectionMappedTypes) => types.repository);
    }

    public getAllRepositoriesObservable(): Observable<BaseRepository<any, any>[]> {
        return this._repositoriesSubject.asObservable();
    }

    public isMeetingSpecificCollection(obj: CollectionType): boolean {
        const repo = this.getRepository(obj);
        if (!repo) {
            return false;
        }
        return repo instanceof BaseRepositoryWithActiveMeeting;
    }
}
