import { Injectable } from '@angular/core';

import { autoupdateFormatToModelData, AutoupdateModelData, ModelData } from './autoupdate-helpers';
import { BaseModel } from '../../shared/models/base/base-model';
import { CollectionMapperService } from './collection-mapper.service';
import { CommunicationManagerService, OfflineError } from './communication-manager.service';
import { DataStoreService, DataStoreUpdateManagerService } from './data-store.service';
import { HTTPMethod } from '../definitions/http-methods';
import { ModelRequestBuilderService, SimplifiedModelRequest } from './model-request-builder.service';
import { Mutex } from '../promises/mutex';

const META_DELETED = 'meta_deleted';

export type FieldDescriptor = RelationFieldDescriptor | GenericRelationFieldDecriptor | StructuredFieldDecriptor;

export interface Fields {
    [field: string]: FieldDescriptor | null;
}

export interface HasFields {
    fields: Fields;
}

export interface ModelRequest extends HasFields {
    ids: number[];
    collection: string;
}

export interface GenericRelationFieldDecriptor extends HasFields {
    type: 'generic-relation-list' | 'generic-relation';
}

export interface RelationFieldDescriptor extends HasFields {
    type: 'relation-list' | 'relation';
    collection: string;
}

export interface StructuredFieldDecriptor {
    type: 'template';
    values?: FieldDescriptor;
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
    private mutex = new Mutex();

    private activeRequests: { [id: number]: { request: ModelRequest; closeFn: () => void } } = {};

    /**
     * Constructor to create the AutoupdateService. Calls the constructor of the parent class.
     * @param websocketService
     * @param DS
     * @param modelMapper
     */
    public constructor(
        private DS: DataStoreService,
        private modelMapper: CollectionMapperService,
        private DSUpdateManager: DataStoreUpdateManagerService,
        private modelRequestBuilder: ModelRequestBuilderService,
        private communicationManager: CommunicationManagerService
    ) {
        this.communicationManager.startCommunicationEvent.subscribe(() => this.startAllAutoupdates());
    }

    public async startAllAutoupdates(): Promise<void> {
        try {
            for (const id of Object.keys(this.activeRequests)) {
                this.startAutoupdate(+id);
            }
        } catch (e) {
            if (e instanceof OfflineError) {
                console.log(e);
            } else {
                console.log('???', e);
            }
        }
    }

    public async simpleRequest(simpleRequest: SimplifiedModelRequest): Promise<ModelSubscription> {
        const request = await this.modelRequestBuilder.build(simpleRequest);
        console.log(simpleRequest, request);
        return await this.request(request);
    }

    public async request(request: ModelRequest): Promise<ModelSubscription> {
        const id = Math.floor(Math.random() * (900000 - 1) + 100000); // [100000, 999999]
        this.activeRequests[id] = {
            request,
            closeFn: () => {
                delete this.activeRequests[id];
            }
        };
        try {
            await this.startAutoupdate(id);
        } catch (e) {
            if (e instanceof OfflineError) {
                console.log(e);
            } else {
                console.log('???', e);
            }
        }
        return { close: this.activeRequests[id].closeFn };
    }

    private async startAutoupdate(id: number): Promise<void> {
        const closeFn = await this.communicationManager.subscribe<AutoupdateModelData>(
            HTTPMethod.POST,
            '/system/autoupdate',
            message => {
                console.log('Got message', message);
                this.handleAutoupdateWithStupidFormat(message);
            },
            () => [this.activeRequests[id].request]
        );

        this.activeRequests[id].closeFn = () => {
            delete this.activeRequests[id];
            closeFn();
        };
    }

    private async handleAutoupdateWithStupidFormat(autoupdateData: AutoupdateModelData): Promise<void> {
        const modelData = autoupdateFormatToModelData(autoupdateData);
        await this.handleAutoupdate(modelData);
    }

    private async handleAutoupdate(modelData: ModelData): Promise<void> {
        console.log('handle autoupdate', modelData);
        const unlock = await this.mutex.lock();

        const deletedModels: DeletedModels = {};
        const changedModels: ChangedModels = {};

        for (const collection of Object.keys(modelData)) {
            for (const id of Object.keys(modelData[collection])) {
                const model = modelData[collection][id];
                if (model[META_DELETED] === true) {
                    if (deletedModels[collection] === undefined) {
                        deletedModels[collection] = [];
                    }
                    deletedModels[collection].push(+id);
                } else {
                    if (changedModels[collection] === undefined) {
                        changedModels[collection] = [];
                    }
                    model.id = +id;
                    const basemodel = this.mapObjectToBaseModel(collection, model);
                    if (basemodel) {
                        changedModels[collection].push(basemodel);
                    }
                }
            }
        }
        console.log(changedModels, deletedModels);
        await this.handleChangedAndDeletedModels(changedModels, deletedModels);
        unlock();
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
