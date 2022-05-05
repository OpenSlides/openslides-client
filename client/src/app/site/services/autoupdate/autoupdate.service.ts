import { Injectable } from '@angular/core';
import { Collection, Id, Ids } from '../../../domain/definitions/key-types';
import { HttpStreamEndpointService, HttpStreamService } from '../../../gateways/http-stream';
import { EndpointConfiguration } from '../../../gateways/http-stream/endpoint-configuration';
import { HttpMethod } from '../../../infrastructure/definitions/http';
import { Mutex } from '../../../infrastructure/utils/promises';
import { CommunicationManagerService } from '../communication-manager.service';
import { ModelRequestBuilderService, ModelRequestObject, SimplifiedModelRequest } from '../model-request-builder';
import { autoupdateFormatToModelData, AutoupdateModelData, ModelData } from './utils';
import { ViewModelStoreUpdateService } from '../view-model-store-update.service';

export type FieldDescriptor = RelationFieldDescriptor | GenericRelationFieldDecriptor | StructuredFieldDecriptor;

export interface Fields {
    [field: string]: FieldDescriptor | null;
}

export interface HasFields {
    fields: Fields;
}

export interface ModelRequest extends HasFields {
    ids: Id[];
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

const AUTOUPDATE_DEFAULT_ENDPOINT = `autoupdate`;

class AutoupdateEndpoint extends EndpointConfiguration {
    public constructor(url: string) {
        super(url, `/system/autoupdate/health`, HttpMethod.POST);
    }
}

const DUMMY_MODEL_SUBSCRIPTION: ModelSubscription = {
    id: 0,
    close: () => {}
};

const COLLECTION_INDEX = 0;
const FIELD_INDEX = 2;

@Injectable({
    providedIn: 'root'
})
export class AutoupdateService {
    private _activeRequestObjects: { [id: number]: ModelRequestObject } = {};
    private _mutex = new Mutex();

    public constructor(
        private communicationManager: CommunicationManagerService,
        private httpEndpointService: HttpStreamEndpointService,
        private httpStreamService: HttpStreamService,
        private viewmodelStoreUpdate: ViewModelStoreUpdateService
    ) {
        this.httpEndpointService.registerEndpoint(
            AUTOUPDATE_DEFAULT_ENDPOINT,
            new AutoupdateEndpoint(`/system/autoupdate`)
        );
    }

    /**
     * Requests a new autoupdate and listen to incoming messages. This is a heavy task.
     * It needs to be closed when it is not needed anymore.
     *
     * @param modelRequest The request data for a list of models, that will be sent to the Autoupdate-Service
     * @param description A simple description for developing. It helps tracking streams:
     * Which component opens which stream?
     */
    public subscribe(modelRequest: ModelRequestObject, description: string): ModelSubscription {
        if (modelRequest instanceof ModelRequestObject) {
            const request = modelRequest.getModelRequest();
            console.log(`autoupdate: new request:`, description, modelRequest, request);
            const modelSubscription = this.request(request, description);
            this._activeRequestObjects[modelSubscription.id] = modelRequest;
            return modelSubscription;
        }
        return DUMMY_MODEL_SUBSCRIPTION;
    }

    private request(request: ModelRequest, description: string): ModelSubscription {
        const buildStreamFn = (streamId: number) =>
            this.httpStreamService.create<AutoupdateModelData>(
                AUTOUPDATE_DEFAULT_ENDPOINT,
                {
                    onMessage: (data, stream) =>
                        this.handleAutoupdate({ autoupdateData: data, id: stream.id, description }),
                    description,
                    id: streamId
                },
                { bodyFn: () => [request] }
            );
        const { closeFn, id } = this.communicationManager.registerStreamBuildFn(buildStreamFn);
        return {
            id,
            close: () => {
                closeFn();
                delete this._activeRequestObjects[id];
            }
        };
    }

    private async handleAutoupdate({
        autoupdateData,
        id,
        description
    }: {
        autoupdateData: AutoupdateModelData;
        id: number;
        description?: string;
    }): Promise<void> {
        const modelData = autoupdateFormatToModelData(autoupdateData);
        console.log(`autoupdate: from stream ${description}`, id, modelData, `raw data:`, autoupdateData);
        const fullListUpdateCollections: { [collection: string]: Ids } = {};
        for (const key of Object.keys(autoupdateData)) {
            const data = key.split(`/`);
            const collectionRelation = `${data[COLLECTION_INDEX]}/${data[FIELD_INDEX]}`;
            if (!this._activeRequestObjects[id]) {
                continue;
            }
            if (this._activeRequestObjects[id].getFullListUpdateCollectionRelations().includes(collectionRelation)) {
                fullListUpdateCollections[
                    this._activeRequestObjects[id].getForeignCollectionByRelation(collectionRelation)
                ] = autoupdateData[key];
            }
        }
        await this.prepareCollectionUpdates(modelData, fullListUpdateCollections);
    }

    private async prepareCollectionUpdates(
        modelData: ModelData,
        fullListUpdateCollections: { [collection: string]: Id[] }
    ): Promise<void> {
        const unlock = await this._mutex.lock();

        this.viewmodelStoreUpdate.triggerUpdate({
            patch: modelData,
            changedModels: fullListUpdateCollections,
            deletedModels: {}
        });

        unlock();
    }
}
