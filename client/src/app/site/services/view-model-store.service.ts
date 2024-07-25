import { Injectable } from '@angular/core';

import { BaseBackendRepository } from '../../gateways/repositories/base-backend-repository';
import { BaseViewModel, ViewModelConstructor } from '../base/base-view-model';
import { CollectionMapperService } from './collection-mapper.service';

@Injectable({
    providedIn: `root`
})
export class ViewModelStoreService {
    public constructor(private collectionMapperService: CollectionMapperService) {}

    /**
     * gets the repository from a collection string or a view model constructor.
     *
     * @param collectionType The collection string or constructor.
     */
    private getRepository<V extends BaseViewModel>(
        collectionType: ViewModelConstructor<V> | string
    ): BaseBackendRepository<V, any> {
        return this.collectionMapperService.getRepository(collectionType) as BaseBackendRepository<V, any>;
    }

    /**
     * Returns the view model identified by the collection and id
     *
     * @param collection The collection of the view model
     * @param id The id of the view model
     */
    public get<V extends BaseViewModel>(collectionType: ViewModelConstructor<V> | string, id: number): V | null {
        return this.getRepository(collectionType).getViewModel(id);
    }

    /**
     * Returns all view models for the given ids.
     *
     * @param collectionType The collection of the view model
     * @param ids All ids to match
     */
    public getMany<T extends BaseViewModel>(collectionType: ViewModelConstructor<T> | string, ids?: number[]): T[] {
        if (!ids) {
            return [];
        }
        const repository = this.getRepository<T>(collectionType);

        return ids.map(id => repository.getViewModel(id)).filter(model => !!model) as T[]; // remove non valid models.
    }

    /**
     * Gets all view models from a collection
     *
     * @param collection  The collection
     * @returns all models from the collection
     */
    public getAll<T extends BaseViewModel>(collectionType: ViewModelConstructor<T> | string): T[] {
        return this.getRepository(collectionType).getViewModelList();
    }

    /**
     * Get all view models from a collection, that satisfy the callback
     *
     * @param collection The collection
     * @param callback The function to check
     * @returns all matched view models of the collection
     */
    public filter<T extends BaseViewModel>(
        collectionType: ViewModelConstructor<T> | string,
        callback: (model: T) => boolean
    ): T[] {
        return this.getAll<T>(collectionType).filter(callback);
    }

    /**
     * Finds one view model from the collection, that satisfies the callback
     *
     * @param collection The collection
     * @param callback THe callback to satisfy
     * @returns a found view model or null, if nothing was found.
     */
    public find<T extends BaseViewModel>(
        collectionType: ViewModelConstructor<T> | string,
        callback: (model: T) => boolean
    ): T | undefined {
        return this.getAll<T>(collectionType).find(callback);
    }
}
