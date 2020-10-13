import { Injectable } from '@angular/core';

import { autoupdateFormatToModelData, AutoupdateModelData, ModelData } from './autoupdate-helpers';
import { BaseModel } from '../../shared/models/base/base-model';
import { CollectionMapperService } from './collection-mapper.service';
import { CommunicationManagerService } from './communication-manager.service';
import { DataStoreService, DataStoreUpdateManagerService } from './data-store.service';
import { HTTPMethod } from '../definitions/http-methods';
import { ModelRequestBuilderService, SimplifiedModelRequest } from './model-request-builder.service';
import { Mutex } from '../promises/mutex';

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
    values?: RelationFieldDescriptor | GenericRelationFieldDecriptor;
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
 * Handles the initial update and automatic updates
 * Incoming objects, usually BaseModels, will be saved in the dataStore (`this.DS`)
 * This service usually creates all models
 */
@Injectable({
    providedIn: 'root'
})
export class AutoupdateService {
    private mutex = new Mutex();

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
        this.communicationManager.registerEndpoint(
            'autoupdate',
            '/system/autoupdate',
            '/system/autoupdate/health',
            HTTPMethod.POST
        );
    }

    public async simpleRequest(simpleRequest: SimplifiedModelRequest): Promise<ModelSubscription> {
        const request = await this.modelRequestBuilder.build(simpleRequest);
        console.log('request send:', simpleRequest, request);
        return await this.request(request);
    }

    public async request(request: ModelRequest): Promise<ModelSubscription> {
        const closeFn = await this.communicationManager.connect<AutoupdateModelData>(
            'autoupdate',
            message => this.handleAutoupdateWithStupidFormat(message),
            () => [request]
        );
        return { close: closeFn };
    }

    private async handleAutoupdateWithStupidFormat(autoupdateData: AutoupdateModelData): Promise<void> {
        const modelData = autoupdateFormatToModelData(autoupdateData);
        console.log('handle autoupdate', modelData, 'raw data:', autoupdateData);
        await this.handleAutoupdate(modelData);
    }

    private async handleAutoupdate(modelData: ModelData): Promise<void> {
        const unlock = await this.mutex.lock();

        const deletedModels: DeletedModels = {};
        const changedModels: ChangedModels = {};

        for (const collection of Object.keys(modelData)) {
            for (const id of Object.keys(modelData[collection])) {
                const model = modelData[collection][id];
                const isDeleted = model.id === null;
                if (isDeleted) {
                    if (deletedModels[collection] === undefined) {
                        deletedModels[collection] = [];
                    }
                    deletedModels[collection].push(+id);
                } else {
                    if (changedModels[collection] === undefined) {
                        changedModels[collection] = [];
                    }
                    // Important: our model system needs to have an id in the model, even if it is partial
                    model.id = +id;
                    const basemodel = this.mapObjectToBaseModel(collection, model);
                    if (basemodel) {
                        changedModels[collection].push(basemodel);
                    }
                }
            }
        }
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
