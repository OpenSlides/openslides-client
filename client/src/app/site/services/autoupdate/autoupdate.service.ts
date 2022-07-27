import { Injectable } from '@angular/core';
import {auditTime, Subject} from 'rxjs';

import { Id, Ids } from '../../../domain/definitions/key-types';
import { HttpStreamEndpointService, HttpStreamService } from '../../../gateways/http-stream';
import { EndpointConfiguration } from '../../../gateways/http-stream/endpoint-configuration';
import { formatQueryParams, HttpMethod, QueryParams } from '../../../infrastructure/definitions/http';
import { Mutex } from '../../../infrastructure/utils/promises';
import { CommunicationManagerService } from '../communication-manager.service';
import { ModelRequestObject } from '../model-request-builder';
import { ViewModelStoreUpdateService } from '../view-model-store-update.service';
import { autoupdateFormatToModelData, AutoupdateModelData, ModelData } from './utils';

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

export interface PendingModelSubscription {
    id: number;
    request: ModelRequest;
    description: string;
    streamId?: Id;
}

const AUTOUPDATE_DEFAULT_ENDPOINT = `autoupdate`;

interface AutoupdateConnectConfig {
    /**
     * Selects one position for a model. This implies `single: 1`.
     */
    position?: number;
    /**
     * Selects the last n updates to the requested fields. `true` is equivalent to `n = 1`.
     */
    single?: true | number;
    /**
     * Determines if the autoupdate service should compress the data, defaults to 1 (=true)
     */
    compress?: number;
}

interface AutoupdateStreamMap {
    [id: number]: {
        subscriptions: number[];
        close: () => void;
    };
}

interface AutoupdateSubscriptionMap {
    [id: number]: {
        autoupdateStreamId?: Id;
        modelRequest: ModelRequestObject;
        modelSubscription: ModelSubscription;
        description: string;
    };
}

interface AutoupdateIncomingMessage {
    autoupdateData: AutoupdateModelData;
    id: Id;
    description?: string;
}

class AutoupdateEndpoint extends EndpointConfiguration {
    public constructor(url: string) {
        super(url, `/system/autoupdate/health`, HttpMethod.POST);
    }
}

const COLLECTION_INDEX = 0;
const FIELD_INDEX = 2;

@Injectable({
    providedIn: `root`
})
export class AutoupdateService {
    private _activeStreams: AutoupdateStreamMap = {};
    private _activeRequestObjects: AutoupdateSubscriptionMap = {};
    private _mutex = new Mutex();
    private _currentQueryParams: QueryParams | null = null;
    private _pendingRequestsSubject: Subject<PendingModelSubscription>;
    private _pendingRequests: PendingModelSubscription[];

    public constructor(
        private communicationManager: CommunicationManagerService,
        private httpEndpointService: HttpStreamEndpointService,
        private httpStreamService: HttpStreamService,
        private viewmodelStoreUpdate: ViewModelStoreUpdateService
    ) {
        this.setAutoupdateConfig(null);
        this.httpEndpointService.registerEndpoint(
            AUTOUPDATE_DEFAULT_ENDPOINT,
            new AutoupdateEndpoint(`/system/autoupdate`)
        );

        this._pendingRequests = [];
        this._pendingRequestsSubject = new Subject<PendingModelSubscription>();
        this._pendingRequestsSubject.subscribe(request => this._pendingRequests.push(request));
        this._pendingRequestsSubject.pipe(auditTime(5)).subscribe(this.startStream());
    }

    public reconnect(config?: AutoupdateConnectConfig): void {
        this.setAutoupdateConfig(config || null);
        for (const id of Object.keys(this._activeRequestObjects)) {
            const streamId = Number(id);
            const { modelSubscription, modelRequest, description } = this._activeRequestObjects[streamId];
            modelSubscription.close();
            const nextModelSubscription = this.request(modelRequest.getModelRequest(), description, streamId);
            this._activeRequestObjects[streamId] = {
                modelSubscription: nextModelSubscription,
                modelRequest,
                description
            };
        }
    }

    public setAutoupdateConfig(config: AutoupdateConnectConfig | null): void {
        this._currentQueryParams = (
            !!config ? (typeof config.compress === `number` ? config : { ...config, compress: 1 }) : { compress: 1 }
        ) as QueryParams;
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
        const request = modelRequest.getModelRequest();
        console.log(`autoupdate: new request:`, description, modelRequest, request);
        const modelSubscription = this.request(request, description);
        this._activeRequestObjects[modelSubscription.id] = { modelRequest, modelSubscription, description };
        return modelSubscription;
    }

    private request(request: ModelRequest, description: string, streamId?: Id): ModelSubscription {
        const id = streamId || Math.floor(Math.random() * (900000 - 1) + 100000);
        const pendingRequest: PendingModelSubscription = {
            id,
            request,
            description,
            streamId
        };

        this._pendingRequestsSubject.next(pendingRequest);

        return {
            id,
            close: () => {
                let streamId = this._activeRequestObjects[id].autoupdateStreamId;
                const sId = this._activeStreams[streamId].subscriptions.indexOf(id);
                if (sId !== -1) {
                    this._activeStreams[streamId].subscriptions.splice(sId, 1)

                    if (!this._activeStreams[streamId].subscriptions.length) {
                        this._activeStreams[streamId].close();
                    }
                }

                delete this._activeRequestObjects[id];
            }
        };
    }

    private startStream() {
        return () => {
            const pendingRequests = this._pendingRequests;
            this._pendingRequests = [];

            const buildStreamFn = (streamId: number) =>
                this.httpStreamService.create<AutoupdateModelData>(
                    {
                        endpointIndex: AUTOUPDATE_DEFAULT_ENDPOINT,
                        customUrlFn: endpointUrl => `${endpointUrl}${formatQueryParams(this._currentQueryParams)}`
                    },
                    {
                        onMessage: (data, stream) =>
                            this.handleAutoupdate({ autoupdateData: data, id: stream.id, description: 'collection' }),
                        description: 'collection',
                        id: streamId
                    },
                    { bodyFn: () => pendingRequests.map(req => req.request) }
                );

            const { closeFn, id } = this.communicationManager.registerStreamBuildFn(buildStreamFn, 0);
            this._activeStreams[id] = {
                subscriptions: pendingRequests.map(req => req.id),
                close: () => {
                    closeFn();
                }
            };

            for (let req of pendingRequests) {
                this._activeRequestObjects[req.id].autoupdateStreamId = id;
            }
        };
    }

    private async handleAutoupdate({ autoupdateData, id, description }: AutoupdateIncomingMessage): Promise<void> {
        const modelData = autoupdateFormatToModelData(autoupdateData);
        console.log(`autoupdate: from stream ${description}`, id, modelData, `raw data:`, autoupdateData);
        const fullListUpdateCollections: { [collection: string]: Ids } = {};
        for (const key of Object.keys(autoupdateData)) {
            const data = key.split(`/`);
            const collectionRelation = `${data[COLLECTION_INDEX]}/${data[FIELD_INDEX]}`;
            const roIds = this._activeStreams[id].subscriptions;
            for (const roId of roIds) {
                if (!this._activeRequestObjects[roId]) {
                    continue;
                }

                const { modelRequest } = this._activeRequestObjects[roId];
                if (!modelRequest) {
                    continue;
                }

                if (modelRequest.getFullListUpdateCollectionRelations().includes(collectionRelation)) {
                    fullListUpdateCollections[modelRequest.getForeignCollectionByRelation(collectionRelation)] =
                        autoupdateData[key];
                }
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
