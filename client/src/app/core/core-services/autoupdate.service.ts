import { Injectable } from '@angular/core';

import { BaseModel } from '../../shared/models/base/base-model';
import { CollectionStringMapperService } from './collection-string-mapper.service';
import { DataStoreService, DataStoreUpdateManagerService } from './data-store.service';
import { HTTPMethod } from './http.service';
import { StreamingCommunicationService } from './streaming-communication.service';

const META_DELETED = 'meta_deleted';

interface Fields {
    fields: {
        [field: string]: GenericRelationFieldDecriptor | RelationFieldDescriptor | StructuredFieldDecriptor | null;
    };
}

export interface ModelRequest extends Fields {
    ids: number[];
    collection: string;
}

interface GenericRelationFieldDecriptor extends Fields {
    type: 'generic-relation-list' | 'generic-relation';
}

interface RelationFieldDescriptor extends Fields {
    type: 'relation-list' | 'relation';
    collection: string;
}

interface StructuredFieldDecriptor {
    type: 'template';
    values?: {
        [field: string]: GenericRelationFieldDecriptor | RelationFieldDescriptor | StructuredFieldDecriptor | null;
    };
}

interface ModelData {
    [collection: string]: {
        [id: number]: object;
    };
}

export interface ModelSubscription {
    close: () => void;
}

interface DeletedModels {
    [collection: string]: number[];
}
interface ChangedModels {
    [collection: string]: BaseModel[];
}
/**
 * Handles the initial update and automatic updates using the {@link WebsocketService}
 * Incoming objects, usually BaseModels, will be saved in the dataStore (`this.DS`)
 * This service usually creates all models
 */
@Injectable({
    providedIn: 'root'
})
export class AutoupdateService {
    /**
     * Constructor to create the AutoupdateService. Calls the constructor of the parent class.
     * @param websocketService
     * @param DS
     * @param modelMapper
     */
    public constructor(
        private streamingCommunicationService: StreamingCommunicationService,
        private DS: DataStoreService,
        private modelMapper: CollectionStringMapperService,
        private DSUpdateManager: DataStoreUpdateManagerService
    ) {
        /*this.websocketService.getOberservable<AutoupdateFormat>('autoupdate').subscribe(response => {
            this.storeResponse(response);
        });*/
        console.warn('TODO: Enable Autoupdate service');
    }

    public request(request: ModelRequest): ModelSubscription {
        const stream = this.streamingCommunicationService.getStream<ModelData>(HTTPMethod.POST, '/todo', request);
        stream.messageObservable.subscribe(data => this.handleAutoupdate(data));
        return { close: stream.close };
    }

    // Todo: change this to private
    public handleAutoupdate(data: ModelData): void {
        const deletedModels: DeletedModels = {};
        const changedModels: ChangedModels = {};

        for (const collection of Object.keys(data)) {
            for (const id of Object.keys(data[collection])) {
                const model = data[collection][id];
                if (model[META_DELETED] === true) {
                    if (deletedModels[collection] === undefined) {
                        deletedModels[collection] = [];
                    }
                    deletedModels[collection].push(+id);
                } else {
                    if (changedModels[collection] === undefined) {
                        changedModels[collection] = [];
                    }
                    model.id = id; // inject id, because it does not come from the server
                    const basemodel = this.mapObjectToBaseModel(collection, model);
                    if (basemodel) {
                        changedModels[collection].push(basemodel);
                    }
                }
            }
        }
        this.handleChangedAndDeletedModels(changedModels, deletedModels);
    }

    private async handleChangedAndDeletedModels(
        changedModels: ChangedModels,
        deletedModels: DeletedModels
    ): Promise<void> {
        const updateSlot = await this.DSUpdateManager.getNewUpdateSlot(this.DS);

        // Delete the removed objects from the DataStore
        for (const collection of Object.keys(deletedModels)) {
            await this.DS.remove(collection, deletedModels[collection]);
        }

        // Add the objects to the DataStore.
        for (const collection of Object.keys(changedModels)) {
            await this.DS.addOrUpdate(changedModels[collection]);
        }

        this.DSUpdateManager.commit(updateSlot);
    }

    /**
     * Creates a BaseModel for the given plain object. If the collection is not registered,
     * a console error will be issued and null returned.
     *
     * @param collection The collection all models have to be from.
     * @param model A model that should be mapped to a BaseModel
     * @returns A basemodel constructed from the given model.
     */
    private mapObjectToBaseModel(collection: string, model: object): BaseModel {
        if (this.modelMapper.isCollectionRegistered(collection)) {
            const targetClass = this.modelMapper.getModelConstructor(collection);
            return new targetClass(model);
        } else {
            console.error(`Unregistered collection "${collection}". Ignore it.`);
            return null;
        }
    }
}
