import { Injectable } from '@angular/core';

import { autoupdateFormatToModelData, AutoupdateModelData, ModelData } from './autoupdate-helpers';
import { BaseModel } from '../../shared/models/base/base-model';
import { CollectionMapperService } from './collection-mapper.service';
import { CommunicationManagerService } from './communication-manager.service';
import { DataStoreService, DataStoreUpdateManagerService } from './data-store.service';
import { HTTPMethod } from '../definitions/http-methods';
import { Collection } from '../definitions/key-types';
import { ModelRequestBuilderService, SimplifiedModelRequest } from './model-request-builder.service';
import { Mutex } from '../promises/mutex';

export type FieldDescriptor = RelationFieldDescriptor | GenericRelationFieldDecriptor | StructuredFieldDecriptor;

export interface Fields {
    [field: string]: FieldDescriptor | null;
}

export interface HasFields {
    fields: Fields;
}

/**
 * Whether a relation requests a list of view-models that updates the whole view-model-store of one repo.
 */
export interface CanBeFullListUpdate {
    isFullList?: boolean;
}

export interface ModelRequest extends HasFields {
    ids: number[];
    collection: string;
}

export interface GenericRelationFieldDecriptor extends HasFields, CanBeFullListUpdate {
    type: 'generic-relation-list' | 'generic-relation';
}

export interface RelationFieldDescriptor extends HasFields, CanBeFullListUpdate {
    type: 'relation-list' | 'relation';
    collection: string;
}

export interface StructuredFieldDecriptor extends CanBeFullListUpdate {
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

    /**
     * Requests a new autoupdate. This is a rather heavy task. It needs to be closed when it is not needed anymore.
     *
     * @param simpleRequest The simple request to send
     * @param description A simple description for developing. It helps tracking streams:
     * Which component opens which stream?
     */
    public async simpleRequest(simpleRequest: SimplifiedModelRequest, description: string): Promise<ModelSubscription> {
        const {
            request,
            collectionsToUpdate
        }: { request: ModelRequest; collectionsToUpdate: Collection[] } = await this.modelRequestBuilder.build(
            simpleRequest
        );
        console.log('autoupdate: new request:', description, simpleRequest, request);
        return await this.request(request, description, collectionsToUpdate);
    }

    private async request(
        request: ModelRequest,
        description: string,
        collectionsToUpdate: Collection[]
    ): Promise<ModelSubscription> {
        const closeFn = await this.communicationManager.connect<AutoupdateModelData>(
            'autoupdate',
            (message, id, isFirstResponse) =>
                this.handleAutoupdateWithStupidFormat(message, id, { collectionsToUpdate, isFirstResponse }),
            () => [request],
            null,
            description
        );
        return { close: closeFn };
    }

    private async handleAutoupdateWithStupidFormat(
        autoupdateData: AutoupdateModelData,
        id: number,
        args: { collectionsToUpdate: Collection[]; isFirstResponse: boolean }
    ): Promise<void> {
        const modelData = autoupdateFormatToModelData(autoupdateData);
        console.log('autoupdate: from stream', id, modelData, 'raw data:', autoupdateData);
        await this.handleAutoupdate(modelData, args.collectionsToUpdate, args.isFirstResponse);
    }

    private async handleAutoupdate(
        modelData: ModelData,
        collectionsToUpdate: Collection[],
        isFirstResponse: boolean
    ): Promise<void> {
        const unlock = await this.mutex.lock();

        const deletedModels: DeletedModels = {};
        const changedModels: ChangedModels = {};
        const fullListUpdate: Collection[] = isFirstResponse ? collectionsToUpdate : [];

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
        await this.handleChangedAndDeletedModels(changedModels, deletedModels, fullListUpdate);

        unlock();
    }

    private async handleChangedAndDeletedModels(
        changedModels: ChangedModels,
        deletedModels: DeletedModels,
        fullListUpdateForCollection: Collection[] = []
    ): Promise<void> {
        const updateSlot = await this.DSUpdateManager.getNewUpdateSlot(this.DS);

        for (const collection of fullListUpdateForCollection) {
            const models = this.DS.getAll(collection);
            const ids = models.map(model => model.id).difference(changedModels[collection].map(model => model.id));
            deletedModels[collection] = (deletedModels[collection] || []).concat(ids);
        }

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
