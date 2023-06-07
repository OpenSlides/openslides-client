import { EventEmitter, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Collection, Ids } from 'src/app/domain/definitions/key-types';

import { BaseModel, ModelConstructor } from '../../domain/models/base/base-model';
import { CollectionMapperService } from './collection-mapper.service';
import { DataStoreUpdateManagerService } from './data-store-update-manager.service';

/**
 * Represents information about a deleted model.
 *
 * As the model doesn't exist anymore, just the former id and collection is known.
 */
interface DeletedInformation {
    collection: string;
    id: number;
}

/**
 * represents a collection in the database, uses an Id to access a {@link BaseModel}.
 *
 * Part of {@link DataStoreService}
 */
interface ModelCollection<T extends BaseModel<T> = any> {
    [id: number]: T;
}

/**
 * The actual storage that stores collections, accessible by strings.
 *
 * {@link DataStoreService}
 */
interface ModelStorage {
    [collection: string]: ModelCollection;
}

@Injectable({
    providedIn: `root`
})
export class DataStoreService {
    protected modelStore: ModelStorage = {};

    /**
     * Subjects for changed elements (notified, even if there is a current update slot) for
     * a specific collection.
     */
    private changedSubjects: { [collection: string]: Subject<BaseModel> } = {};

    /**
     * Observable subject for changed or deleted models in the datastore.
     */
    private readonly modifiedSubject: Subject<void> = new Subject<void>();

    /**
     * Observe the datastore for changes and deletions.
     *
     * @return an observable for changed and deleted objects.
     */
    public get modifiedObservable(): Observable<void> {
        return this.modifiedSubject;
    }

    /**
     * Observable subject for changed or deleted models in the datastore.
     */
    protected readonly clearEvent: EventEmitter<string[]> = new EventEmitter<string[]>();

    /**
     * Observe the datastore for changes and deletions.
     *
     * @return an observable for changed and deleted objects.
     */
    public get clearObservable(): Observable<string[]> {
        return this.clearEvent;
    }

    public constructor(
        protected modelMapper: CollectionMapperService,
        private DSUpdateManager: DataStoreUpdateManagerService
    ) {}

    /**
     * Get an model observable for models from a given collection. These observable will be notified,
     * even if there is an active update slot. So use this with caution (-> only collections with less models).
     *
     * @param collectionType The collection
     */
    public getChangeObservable<T extends BaseModel>(collectionType: ModelConstructor<T> | string): Observable<T> {
        const collection = this.getCollection(collectionType);
        if (!this.changedSubjects[collection]) {
            this.changedSubjects[collection] = new Subject();
        }
        return this.changedSubjects[collection] as Observable<any>;
    }

    /**
     * Clears the complete DataStore and Cache.
     */
    public async clear(): Promise<void> {
        this.modelStore = {};
        this.clearEvent.next([]);
    }

    /**
     * Returns the collection _string_ based on the model given. If a string is given, it's just returned.
     * @param collectionType Either a Model constructor or a string.
     * @returns the collection string
     */
    private getCollection<T extends BaseModel<T>>(collectionType: ModelConstructor<T> | string): string {
        if (typeof collectionType === `string`) {
            return collectionType;
        } else {
            return this.modelMapper.getCollection(collectionType);
        }
    }

    /**
     * Read one model based on the collection and id from the DataStore.
     *
     * @param collectionType The desired BaseModel or collection to be read from the dataStore
     * @param ids One ID of the BaseModel
     * @return The given BaseModel-subclass instance
     * @example: this.DS.get(User, 1)
     * @example: this.DS.get<Countdown>('core/countdown', 2)
     */
    public get<T extends BaseModel<T>>(collectionType: ModelConstructor<T> | string, id: number): T | undefined {
        const collection = this.getCollection<T>(collectionType);

        const modelCollection: ModelCollection = this.modelStore[collection];
        if (!modelCollection) {
            return undefined;
        } else {
            return modelCollection[id] as T;
        }
    }

    /**
     * Read multiple ID's from dataStore.
     *
     * @param collectionType The desired BaseModel or collection to be read from the dataStore
     * @param ids Multiple IDs as a list of IDs of BaseModel
     * @return The BaseModel-list corresponding to the given ID(s)
     * @example: this.DS.getMany(User, [1,2,3,4,5])
     * @example: this.DS.getMany<User>('users/user', [1,2,3,4,5])
     */
    public getMany<T extends BaseModel<T>>(collectionType: ModelConstructor<T> | string, ids: number[]): T[] {
        const collection = this.getCollection<T>(collectionType);

        const modelCollection: ModelCollection = this.modelStore[collection];
        if (!modelCollection) {
            return [];
        }
        const models = ids.map(id => modelCollection[id]).filter(model => !!model); // remove non valid models.
        return models as T[];
    }

    /**
     * Get all models of the given collection from the DataStore.
     *
     * @param collectionType The desired BaseModel or collection to be read from the dataStore
     * @return The BaseModel-list of all instances of T
     * @example: this.DS.getAll(User)
     * @example: this.DS.getAll<User>('users/user')
     */
    public getAll<T extends BaseModel<T>>(collectionType: ModelConstructor<T> | string): T[] {
        const modelCollection = this.getModelCollectionFor(collectionType);
        return Object.values(modelCollection);
    }

    public getIdsFor<T extends BaseModel<T>>(collectionType: ModelConstructor<T> | string): Ids {
        const modelCollection = this.getModelCollectionFor(collectionType);
        return Object.keys(modelCollection).map(id => +id);
    }

    /**
     * Filters the dataStore by type.
     *
     * @param collectionType The desired BaseModel type to be read from the dataStore
     * @param callback a filter function
     * @return The BaseModel-list corresponding to the filter function
     * @example this.DS.filter<User>(User, myUser => myUser.first_name === "Max")
     */
    public filter<T extends BaseModel<T>>(
        collectionType: ModelConstructor<T> | string,
        callback: (model: T) => boolean
    ): T[] {
        return this.getAll<T>(collectionType).filter(callback);
    }

    /**
     * Finds a model item in the dataStore by type.
     *
     * @param collectionType The desired BaseModel type to be read from the dataStore
     * @param callback a find function
     * @return The first BaseModel item matching the filter function
     * @example this.DS.find<User>(User, myUser => myUser.first_name === "Jenny")
     */
    public find<T extends BaseModel<T>>(
        collectionType: ModelConstructor<T> | string,
        callback: (model: T) => boolean
    ): T | undefined {
        return this.getAll<T>(collectionType).find(callback);
    }

    /**
     * Add one or multiple models to dataStore.
     *
     * @param models BaseModels to add to the store
     * @example this.DS.add([new User(1)])
     * @example this.DS.add([new User(2), new User(3)])
     * @example this.DS.add(arrayWithUsers)
     */
    public async add(models: BaseModel[]): Promise<void> {
        models.forEach(model => {
            const collection = model.collection;
            if (this.modelStore[collection] === undefined) {
                this.modelStore[collection] = {};
            }
            this.modelStore[collection][model.id] = model;
            this.publishChangedInformation(model);
        });
    }

    public async addOrUpdate(models: BaseModel[]): Promise<void> {
        models.forEach(model => {
            const collection = model.collection;
            if (this.modelStore[collection] === undefined) {
                this.modelStore[collection] = {};
            }

            if (this.modelStore[collection][model.id]) {
                const storedModel = this.modelStore[collection][model.id];
                const updatedData = storedModel.getUpdatedData(model);
                const targetClass = this.modelMapper.getModelConstructor(collection);
                if (targetClass) {
                    this.modelStore[collection][model.id] = new targetClass(updatedData);
                }
            } else {
                this.modelStore[collection][model.id] = model;
            }

            this.publishChangedInformation(this.modelStore[collection][model.id]);
        });
    }

    /**
     * removes one or multiple models from dataStore.
     *
     * @param collection The desired BaseModel type to be removed from the datastore
     * @param ids A list of IDs of BaseModels to remove from the datastore
     *
     * @example this.DS.remove('users/user', [myUser.id, 3, 4])
     */
    public async remove(collection: string, ids: number[]): Promise<void> {
        ids.forEach(id => {
            if (this.modelStore[collection]) {
                delete this.modelStore[collection][id];
            }
            this.publishDeletedInformation({
                collection,
                id
            });
        });
    }

    /**
     * Resets the DataStore and set the given models as the new content.
     * @param models A list of models to set the DataStore to.
     */
    public async set(models?: BaseModel[]): Promise<void> {
        const modelStoreReference = this.modelStore;
        this.modelStore = {};
        // Inform about the deletion
        Object.keys(modelStoreReference).forEach(collection => {
            Object.keys(modelStoreReference[collection]).forEach(id => {
                this.publishDeletedInformation({
                    collection,
                    id: +id // needs casting, because Objects.keys gives all keys as strings...
                });
            });
        });
        if (models && models.length) {
            await this.add(models);
        }
    }

    public getCollections(): Collection[] {
        return Object.keys(this.modelStore);
    }

    public deleteCollections(...collections: Collection[]): void {
        for (const collection of collections) {
            delete this.modelStore[collection];
        }
        this.triggerModifiedObservable();
        this.clearEvent.emit(collections);
    }

    /**
     * Informs the changed and changedOrDeleted subject about a change.
     *
     * @param model The model to publish
     */
    private publishChangedInformation(model: BaseModel): void {
        const slot = this.DSUpdateManager.getCurrentUpdateSlot();
        if (slot) {
            slot.addChangedModel(model.collection, model.id);
            // triggerModifiedObservable will be called by committing the update slot.
        } else {
            this.triggerModifiedObservable();
        }

        if (this.changedSubjects[model.collection]) {
            this.changedSubjects[model.collection].next(model);
        }
    }

    /**
     * Informs the deleted and changedOrDeleted subject about a deletion.
     *
     * @param information The information about the deleted model
     */
    private publishDeletedInformation(information: DeletedInformation): void {
        const slot = this.DSUpdateManager.getCurrentUpdateSlot();
        if (slot) {
            slot.addDeletedModel(information.collection, information.id);
            // triggerModifiedObservable will be called by committing the update slot.
        } else {
            this.triggerModifiedObservable();
        }
    }

    private getModelCollectionFor<T extends BaseModel<T>>(
        collectionType: ModelConstructor<T> | string
    ): ModelCollection<T> {
        const collection = this.getCollection(collectionType);
        const modelCollection = this.modelStore[collection];
        if (!modelCollection) {
            return {};
        }
        return modelCollection;
    }

    /**
     * Triggers the modified subject.
     */
    public triggerModifiedObservable(): void {
        this.modifiedSubject.next();
    }
}
