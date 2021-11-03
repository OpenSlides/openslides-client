import { Injectable } from '@angular/core';
import { Id } from 'app/core/definitions/key-types';

import { BaseModel } from '../../shared/models/base/base-model';
import { HTTPMethod } from '../definitions/http-methods';
import { ModelRequestObject } from '../definitions/model-request-object';
import { Mutex } from '../promises/mutex';
import { autoupdateFormatToModelData, AutoupdateModelData, ModelData } from './autoupdate-helpers';
import { CollectionMapperService } from './collection-mapper.service';
import { CommunicationManagerService } from './communication-manager.service';
import { DataStoreService, DataStoreUpdateManagerService } from './data-store.service';
import { HttpStreamService } from './http-stream.service';
import { EndpointConfiguration, HttpStreamEndpointService } from './http-stream-endpoint.service';
import { ModelRequestBuilderService, SimplifiedModelRequest } from './model-request-builder.service';

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
    id: Id;
    close: () => void;
}

interface DeletedModels {
    [collection: string]: number[];
}
interface ChangedModels {
    [collection: string]: BaseModel[];
}

const AUTOUPDATE_DEFAULT_ENDPOINT = `autoupdate`;
const AUTOUPDATE_SINGLE_ENDPOINT = `autoupdate?single`;

class AutoupdateEndpoint extends EndpointConfiguration {
    public constructor(url: string) {
        super(url, `/system/autoupdate/health`, HTTPMethod.POST);
    }
}

/**
 * Handles the initial update and automatic updates
 * Incoming objects, usually BaseModels, will be saved in the dataStore (`this.DS`)
 * This service usually creates all models
 */
@Injectable({
    providedIn: `root`
})
export class AutoupdateService {
    private _activeRequestObjects: { [id: number]: ModelRequestObject } = {};
    private _mutex = new Mutex();

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
        private communicationManager: CommunicationManagerService,
        private httpEndpointService: HttpStreamEndpointService,
        private httpStreamService: HttpStreamService
    ) {
        this.httpEndpointService.registerEndpoint(
            AUTOUPDATE_DEFAULT_ENDPOINT,
            new AutoupdateEndpoint(`/system/autoupdate`)
        );
        this.httpEndpointService.registerEndpoint(
            AUTOUPDATE_SINGLE_ENDPOINT,
            new AutoupdateEndpoint(`/system/autoupdate?single=true`)
        );
    }

    /**
     * Requests a new autoupdate only one time. This method finishes after the incoming data from the autoupdate
     * was applied to the existing datastore (from this client).
     *
     * @param modelRequest The request data for a list of models, that will be sent to the Autoupdate-Service
     * @param description A simple description for developing. It helps tracking streams:
     * Which component requests the autoupdate?
     */
    public async instant(modelRequest: SimplifiedModelRequest, description: string): Promise<void> {
        const modelRequestObject = await this.modelRequestBuilder.build(modelRequest);
        const request = modelRequestObject.getModelRequest();
        const httpStream = this.httpStreamService.create(
            AUTOUPDATE_SINGLE_ENDPOINT,
            {
                description
            },
            { bodyFn: () => [request] }
        );
        const { data, stream } = await httpStream.toPromise();
        await this.handleAutoupdateWithStupidFormat(data, stream.id);
    }

    /**
     * Requests a new autoupdate and listen to incoming messages. This is a rather heavy task.
     * It needs to be closed when it is not needed anymore.
     *
     * @param modelRequest The request data for a list of models, that will be sent to the Autoupdate-Service
     * @param description A simple description for developing. It helps tracking streams:
     * Which component opens which stream?
     */
    public async subscribe(modelRequest: SimplifiedModelRequest, description: string): Promise<ModelSubscription> {
        if (modelRequest.ids.length > 0 && modelRequest.ids.every(id => typeof id === `number`)) {
            const modelRequestObject = await this.modelRequestBuilder.build(modelRequest);
            const request = modelRequestObject.getModelRequest();
            console.log(`autoupdate: new request:`, description, modelRequest, request);
            const modelSubscription = await this.request(request, description);
            this._activeRequestObjects[modelSubscription.id] = modelRequestObject;
            return modelSubscription;
        }
    }

    private async request(request: ModelRequest, description: string): Promise<ModelSubscription> {
        const httpStream = this.httpStreamService.create(
            AUTOUPDATE_DEFAULT_ENDPOINT,
            {
                onMessage: (data, _, stream) => this.handleAutoupdateWithStupidFormat(data, stream.id),
                description
            },
            { bodyFn: () => [request] }
        );
        const closeFn = this.communicationManager.registerStream(httpStream);
        return {
            id: httpStream.id,
            close: () => {
                closeFn();
                delete this._activeRequestObjects[httpStream.id];
            }
        };
    }

    private async handleAutoupdateWithStupidFormat(autoupdateData: AutoupdateModelData, id: number): Promise<void> {
        const modelData = autoupdateFormatToModelData(autoupdateData);
        console.log(`autoupdate: from stream`, id, modelData, `raw data:`, autoupdateData);
        const fullListUpdateCollections = {};
        for (const key of Object.keys(autoupdateData)) {
            const data = key.split(`/`);
            const collectionRelation = `${data[0]}/${data[2]}`;
            if (this._activeRequestObjects[id].getFullListUpdateCollectionRelations().includes(collectionRelation)) {
                fullListUpdateCollections[
                    this._activeRequestObjects[id].getForeignCollectionByRelation(collectionRelation)
                ] = autoupdateData[key];
            }
        }
        await this.handleAutoupdate(modelData, fullListUpdateCollections);
    }

    private async handleAutoupdate(
        modelData: ModelData,
        fullListUpdateCollections: { [collection: string]: Id[] }
    ): Promise<void> {
        const unlock = await this._mutex.lock();

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
        await this.handleChangedAndDeletedModels(changedModels, deletedModels, fullListUpdateCollections);

        unlock();
    }

    private async handleChangedAndDeletedModels(
        changedModels: ChangedModels,
        deletedModels: DeletedModels,
        fullListUpdateCollections: { [collection: string]: Id[] }
    ): Promise<void> {
        const updateSlot = await this.DSUpdateManager.getNewUpdateSlot(this.DS);

        for (const collection of Object.keys(fullListUpdateCollections)) {
            const models = this.DS.getAll(collection);
            const ids = models.map(model => model.id).difference(fullListUpdateCollections[collection]);
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
