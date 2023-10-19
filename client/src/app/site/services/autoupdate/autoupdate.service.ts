import { Injectable } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { firstValueFrom } from 'rxjs';
import { ModelRequest } from 'src/app/domain/interfaces/model-request';

import { Collection, Id, Ids } from '../../../domain/definitions/key-types';
import { HttpStreamEndpointService } from '../../../gateways/http-stream';
import { EndpointConfiguration } from '../../../gateways/http-stream/endpoint-configuration';
import { HttpMethod, QueryParams } from '../../../infrastructure/definitions/http';
import { Mutex } from '../../../infrastructure/utils/promises';
import { BannerDefinition, BannerService } from '../../modules/site-wrapper/services/banner.service';
import { LifecycleService } from '../lifecycle.service';
import { ModelRequestObject } from '../model-request-builder';
import { ViewModelStoreUpdateService } from '../view-model-store-update.service';
import { WindowVisibilityService } from '../window-visibility.service';
import { AutoupdateCommunicationService } from './autoupdate-communication.service';
import { autoupdateFormatToModelData, AutoupdateModelData, ModelData } from './utils';

export interface ModelSubscription {
    id: Id;
    receivedData: Promise<ModelData>;
    close: () => void;
}

export const AUTOUPDATE_DEFAULT_ENDPOINT = `autoupdate`;

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

interface AutoupdateSubscriptionMap {
    [id: number]: {
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
const ID_INDEX = 1;
const FIELD_INDEX = 2;

export const OUT_OF_SYNC_BANNER: BannerDefinition = {
    text: _(`Out of sync`),
    icon: `sync_disabled`
};

const PAUSE_ON_INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 Minutes

@Injectable({
    providedIn: `root`
})
export class AutoupdateService {
    private _activeRequestObjects: AutoupdateSubscriptionMap = {};
    private _mutex = new Mutex();
    private _currentQueryParams: QueryParams | null = null;
    private _resolveDataReceived: ((value: ModelData) => void)[] = [];

    public constructor(
        private httpEndpointService: HttpStreamEndpointService,
        private viewmodelStoreUpdate: ViewModelStoreUpdateService,
        private communication: AutoupdateCommunicationService,
        private bannerService: BannerService,
        private visibilityService: WindowVisibilityService,
        private lifecycle: LifecycleService
    ) {
        this.setAutoupdateConfig(null);
        this.httpEndpointService.registerEndpoint(
            AUTOUPDATE_DEFAULT_ENDPOINT,
            new AutoupdateEndpoint(`/system/autoupdate`)
        );

        this.communication.setEndpoint(AUTOUPDATE_DEFAULT_ENDPOINT);
        this.communication.listen().subscribe(data => {
            this.handleAutoupdate({ autoupdateData: data.data, id: data.streamId, description: data.description });
        });
        this.communication.listenShouldReconnect().subscribe(() => {
            this.pauseUntilVisible();
        });

        firstValueFrom(this.lifecycle.appLoaded).then(() =>
            this.visibilityService.hiddenFor(PAUSE_ON_INACTIVITY_TIMEOUT).subscribe(() => {
                this.pauseUntilVisible();
            })
        );

        window.addEventListener(`beforeunload`, () => {
            for (const id of Object.keys(this._activeRequestObjects)) {
                const streamId = Number(id);
                const { modelSubscription } = this._activeRequestObjects[streamId];
                modelSubscription.close();
            }
        });
    }

    public async pauseUntilVisible(): Promise<void> {
        const showBannerTimeout = setTimeout(() => {
            this.bannerService.addBanner(OUT_OF_SYNC_BANNER);
        }, 2000);
        const pausedRequests: { start: () => Promise<any>; info: any }[] = [];
        for (const id of Object.keys(this._activeRequestObjects)) {
            const streamId = Number(id);
            const { modelSubscription, modelRequest, description } = this._activeRequestObjects[streamId];
            pausedRequests.push({
                start: () => this.request(modelRequest.getModelRequest(), description, streamId),
                info: this._activeRequestObjects[streamId]
            });
            console.debug(`[autoupdate] pause request:`, description);
            modelSubscription.close();
        }

        await this.visibilityService.waitUntilVisible();

        const openRequests = [];
        for (const reqData of pausedRequests) {
            const { modelRequest, description } = reqData.info;
            const req = reqData.start();
            openRequests.push(req);
            req.then(nextModelSubscription => {
                console.debug(`[autoupdate] resume request:`, description, [modelRequest]);
                this._activeRequestObjects[nextModelSubscription.id] = {
                    modelSubscription: nextModelSubscription,
                    modelRequest,
                    description
                };
            });
        }

        Promise.all(openRequests).then(() => {
            clearTimeout(showBannerTimeout);
            this.bannerService.removeBanner(OUT_OF_SYNC_BANNER);
        });
    }

    public reconnect(config?: AutoupdateConnectConfig): void {
        this.setAutoupdateConfig(config || null);
        for (const id of Object.keys(this._activeRequestObjects)) {
            const streamId = Number(id);
            const { modelSubscription, modelRequest, description } = this._activeRequestObjects[streamId];
            modelSubscription.close();
            this.request(modelRequest.getModelRequest(), description, streamId).then(nextModelSubscription => {
                console.debug(`[autoupdate] reconnect request:`, description, [modelRequest]);
                this._activeRequestObjects[nextModelSubscription.id] = {
                    modelSubscription: nextModelSubscription,
                    modelRequest,
                    description
                };
            });
        }
    }

    public setAutoupdateConfig(config: AutoupdateConnectConfig | null): void {
        this._currentQueryParams = (
            !!config ? (typeof config.compress === `number` ? config : { ...config, compress: 1 }) : { compress: 1 }
        ) as QueryParams;
    }

    /**
     * Requests single data from autoupdate.
     *
     * @param modelRequest The request data for a list of models, that will be sent to the Autoupdate-Service
     * @param description A simple description for developing. It helps tracking streams:
     * Which component opens which stream?
     */
    public async single(modelRequest: ModelRequestObject, description: string): Promise<ModelData> {
        const request = modelRequest.getModelRequest();
        console.debug(`[autoupdate] new single request:`, description, [modelRequest, request]);
        const modelSubscription = await this.request(request, description, null, { single: 1 });
        this._activeRequestObjects[modelSubscription.id] = { modelRequest, modelSubscription, description };
        const data = await modelSubscription.receivedData;
        modelSubscription.close();
        return data;
    }

    /**
     * Requests a new autoupdate and listen to incoming messages. This is a heavy task.
     * It needs to be closed when it is not needed anymore.
     *
     * @param modelRequest The request data for a list of models, that will be sent to the Autoupdate-Service
     * @param description A simple description for developing. It helps tracking streams:
     * Which component opens which stream?
     */
    public async subscribe(modelRequest: ModelRequestObject, description: string): Promise<ModelSubscription> {
        const request = modelRequest.getModelRequest();
        console.debug(`[autoupdate] new request:`, description, [modelRequest, request]);
        const modelSubscription = await this.request(request, description);
        this._activeRequestObjects[modelSubscription.id] = { modelRequest, modelSubscription, description };
        return modelSubscription;
    }

    private async request(
        request: ModelRequest,
        description: string,
        streamId?: Id,
        customParams?: QueryParams
    ): Promise<ModelSubscription> {
        const id = await this.communication.open(
            streamId,
            description,
            request,
            Object.assign({}, this._currentQueryParams, customParams || {})
        );

        let rejectReceivedData: any;
        const receivedData = new Promise<ModelData>((resolve, reject) => {
            this._resolveDataReceived[id] = resolve;
            rejectReceivedData = reject;
        });

        return {
            id,
            receivedData,
            close: () => {
                this.communication.close(id);
                delete this._activeRequestObjects[id];
                if (this._resolveDataReceived[id]) {
                    rejectReceivedData();
                }

                console.debug(`[autoupdate] stream closed: `, description);
            }
        };
    }

    private async handleAutoupdate({ autoupdateData, id, description }: AutoupdateIncomingMessage): Promise<void> {
        if (!this._activeRequestObjects || !this._activeRequestObjects[id]) {
            return;
        }

        const modelData = autoupdateFormatToModelData(autoupdateData);
        console.debug(`[autoupdate] from stream:`, description, id, [modelData, autoupdateData]);
        const fullListUpdateCollections: {
            [collection: string]: Ids;
        } = {};
        const exclusiveListUpdateCollections: {
            [collection: string]: { ids: Ids; parentCollection: Collection; parentField: string; parentId: Id };
        } = {};

        const { modelRequest } = this._activeRequestObjects[id];
        if (modelRequest) {
            for (const key of Object.keys(autoupdateData)) {
                const data = key.split(`/`);
                const collectionRelation = `${data[COLLECTION_INDEX]}/${data[FIELD_INDEX]}`;
                if (modelRequest.getFullListUpdateCollectionRelations().includes(collectionRelation)) {
                    fullListUpdateCollections[modelRequest.getForeignCollectionByRelation(collectionRelation)] =
                        autoupdateData[key];
                } else if (modelRequest.getExclusiveListUpdateCollectionRelations().includes(collectionRelation)) {
                    exclusiveListUpdateCollections[modelRequest.getForeignCollectionByRelation(collectionRelation)] = {
                        ids: autoupdateData[key],
                        parentCollection: data[COLLECTION_INDEX],
                        parentField: data[FIELD_INDEX],
                        parentId: +data[ID_INDEX]
                    };
                }
            }
        }

        await this.prepareCollectionUpdates(modelData, fullListUpdateCollections, exclusiveListUpdateCollections, id);
    }

    private async prepareCollectionUpdates(
        modelData: ModelData,
        fullListUpdateCollections: {
            [collection: string]: Ids;
        },
        exclusiveListUpdateCollections: {
            [collection: string]: { ids: Ids; parentCollection: Collection; parentField: string; parentId: Id };
        },
        requestId: number
    ): Promise<void> {
        const unlock = await this._mutex.lock();

        this.viewmodelStoreUpdate
            .triggerUpdate({
                patch: modelData,
                changedModels: exclusiveListUpdateCollections,
                changedFullListModels: fullListUpdateCollections,
                deletedModels: {}
            })
            .then(deletedModels => {
                this.communication.cleanupCollections(requestId, deletedModels);

                if (this._resolveDataReceived[requestId]) {
                    this._resolveDataReceived[requestId](modelData);
                    delete this._resolveDataReceived[requestId];
                }
            });

        unlock();
    }
}
