import { Injectable } from '@angular/core';

import { Deferred } from '../../infrastructure/utils/promises';
import { CollectionMapperService } from './collection-mapper.service';
import { DataStoreService } from './data-store.service';
import { ChangedModels } from './view-model-store-update.service';

interface CollectionIds {
    [collection: string]: number[];
}

/**
 * Helper class for collecting data during the update phase of the DataStore.
 */
class UpdateSlot {
    /**
     * Count instnaces of this class to easily compare them.
     */
    private static ID_COUNTER = 1;

    /**
     * Mapping of changed model ids to their collection.
     */
    private changedModels: CollectionIds = {};

    /**
     * Mapping of deleted models to their collection.
     */
    private deletedModels: CollectionIds = {};

    /**
     * The object's id.
     */
    private _id: number;

    /**
     * @param DS Carries the DataStore: TODO (see below `DataStoreUpdateManagerService.getNewUpdateSlot`)
     */
    public constructor(public readonly DS: DataStoreService) {
        this._id = UpdateSlot.ID_COUNTER++;
    }

    /**
     * Adds changed model information
     *
     * @param collection The collection
     * @param id The id
     */
    public addChangedModel(collection: string, id: number): void {
        if (!this.changedModels[collection]) {
            this.changedModels[collection] = [];
        }
        this.changedModels[collection].push(id);
    }

    /**
     * Adds deleted model information
     *
     * @param collection The collection
     * @param id The id
     */
    public addDeletedModel(collection: string, id: number): void {
        if (!this.deletedModels[collection]) {
            this.deletedModels[collection] = [];
        }
        this.deletedModels[collection].push(id);
    }

    /**
     * @param collection The collection
     * @returns the list of changed model ids for the collection
     */
    public getChangedModelIdsForCollection(collection: string): number[] {
        return this.changedModels[collection] || [];
    }

    /**
     * @returns the mapping of all changed models
     */
    public getChangedModels(): CollectionIds {
        return this.changedModels;
    }

    /**
     * @param collection The collection
     * @returns the list of deleted model ids for the collection
     */
    public getDeletedModelIdsForCollection(collection: string): number[] {
        return this.deletedModels[collection] || [];
    }

    /**
     * @returns the mapping of all deleted models
     */
    public getDeletedModels(): CollectionIds {
        return this.deletedModels;
    }

    /**
     * @returns all changed and deleted model ids in one array. If an id was
     * changed and deleted, it will be there twice! But this should not be the case.
     */
    public getAllModelsIdsForCollection(collection: string): number[] {
        return this.getDeletedModelIdsForCollection(collection).concat(
            this.getChangedModelIdsForCollection(collection)
        );
    }

    /**
     * Compares this object to another update slot.
     */
    public equal(other: UpdateSlot): boolean {
        return this._id === other._id;
    }
}

@Injectable({
    providedIn: `root`
})
export class DataStoreUpdateManagerService {
    /**
     * The current update slot
     */
    private currentUpdateSlot: UpdateSlot | null = null;

    /**
     * Requests for getting an update slot.
     */
    private updateSlotRequests: Deferred[] = [];

    /**
     * @param mapperService
     */
    public constructor(private mapperService: CollectionMapperService) {}

    /**
     * Retrieve the current update slot.
     */
    public getCurrentUpdateSlot(): UpdateSlot | null {
        return this.currentUpdateSlot;
    }

    /**
     * Get a new update slot. Returns a promise that must be awaited, if there is another
     * update in progress.
     *
     * @param DS The DataStore. This is a hack, becuase we cannot use the DataStore
     * here, because these are cyclic dependencies... --> TODO
     */
    public async getNewUpdateSlot(DS: DataStoreService): Promise<UpdateSlot> {
        if (this.currentUpdateSlot) {
            const request = new Deferred();
            this.updateSlotRequests.push(request);
            await request;
        }
        this.currentUpdateSlot = new UpdateSlot(DS);
        return this.currentUpdateSlot;
    }

    /**
     * Commits the given update slot. This slot must be the current one. If there are requests
     * for update slots queued, the next one will be served.
     *
     * Note: I added this param to make sure, that only the user of the slot
     * can commit the update and no one else.
     *
     * @param slot The slot to commit
     */
    public commit(slot: UpdateSlot, changedModels: ChangedModels): void {
        if (!this.currentUpdateSlot || !this.currentUpdateSlot.equal(slot)) {
            throw new Error(`No or wrong update slot to be finished!`);
        }
        this.currentUpdateSlot = null;

        // notify repositories in two phases
        const repositories = this.mapperService.getAllRepositories();

        // Phase 1: deleting and creating of view models (in this order)
        repositories.forEach(repo => {
            const deletedModelIds = slot.getDeletedModelIdsForCollection(repo.collection);
            repo.deleteModels(deletedModelIds);

            const changedModelIds = slot.getChangedModelIdsForCollection(repo.collection);
            repo.changedModels(changedModelIds, changedModels[repo.COLLECTION]);
        });

        // Phase 2: updating all repositories
        repositories.forEach(repo => {
            repo.commitUpdate(slot.getAllModelsIdsForCollection(repo.collection));
        });

        slot.DS.triggerModifiedObservable();

        this.serveNextSlot();
    }

    public dropUpdateSlot(): void {
        this.currentUpdateSlot = null;
        this.serveNextSlot();
    }

    private serveNextSlot(): void {
        if (this.updateSlotRequests.length > 0) {
            console.log(`Concurrent update slots`);
            const request = this.updateSlotRequests.pop();
            request?.resolve();
        }
    }
}
