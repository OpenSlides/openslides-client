import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BaseModel, ModelConstructor } from 'src/app/domain/models/base/base-model';
import { BaseRepository } from 'src/app/gateways/repositories/base-repository';
import { BaseViewModel, ViewModelConstructor } from 'src/app/site/base/base-view-model';

import { CollectionMapper } from './collection-mapper';
import { CollectionMappedTypes, CollectionType } from './definitions';

@Injectable({
    providedIn: `root`
})
export class CollectionMapperService implements CollectionMapper {
    public get afterRepositoryRegistered(): Observable<CollectionMappedTypes<any, any>> {
        return this._repositoryRegistered;
    }

    /**
     * Maps collection strings to mapping entries
     */
    private readonly _collectionMapping: {
        [collection: string]: CollectionMappedTypes<any, any>;
    } = {};

    private readonly _repositoriesSubject = new BehaviorSubject<BaseRepository<BaseViewModel, BaseModel>[]>([]);

    private readonly _repositoryRegistered = new EventEmitter<CollectionMappedTypes<any, any>>();

    /**
     * Registers the combination of a collection string, model, view model and repository
     */
    public registerCollectionElement<V extends BaseViewModel<M>, M extends BaseModel>(
        modelConstructor: ModelConstructor<M>,
        viewModelConstructor: ViewModelConstructor<V>,
        repository: BaseRepository<V, M>
    ): void {
        const mapping: CollectionMappedTypes<V, M> = { modelConstructor, viewModelConstructor, repository };
        this._collectionMapping[modelConstructor.COLLECTION] = mapping;
        this._repositoriesSubject.next(this.getAllRepositories());
        this._repositoryRegistered.emit(mapping);
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
        return null;
    }

    /**
     * @param obj The object to get the view model constructor from.
     * @returns the view model constructor
     */
    public getViewModelConstructor<M extends BaseViewModel>(obj: CollectionType): ViewModelConstructor<M> | null {
        if (this.isCollectionRegistered(this.getCollection(obj))) {
            return this._collectionMapping[this.getCollection(obj)].viewModelConstructor as ViewModelConstructor<M>;
        }
        return null;
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
        return null;
    }

    /**
     * @returns all registered repositories.
     */
    public getAllRepositories(): BaseRepository<any, any>[] {
        return Object.values(this._collectionMapping).map((types: CollectionMappedTypes<any, any>) => types.repository);
    }

    public getAllCollectionMaps(): CollectionMappedTypes<any, any>[] {
        return Object.values(this._collectionMapping);
    }
}
