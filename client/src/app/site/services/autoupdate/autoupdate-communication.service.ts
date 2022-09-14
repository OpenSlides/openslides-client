import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { HttpStreamEndpointService } from 'src/app/gateways/http-stream';
import { formatQueryParams } from 'src/app/infrastructure/definitions/http';
import { djb2hash } from 'src/app/infrastructure/utils';
import { SharedWorkerService } from 'src/app/openslides-main-module/services/shared-worker.service';

import { AuthTokenService } from '../auth-token.service';
import { ModelRequest } from './autoupdate.service';

@Injectable({
    providedIn: `root`
})
export class AutoupdateCommunicationService {
    private autoupdateDataObservable: Observable<any>;
    private openResolvers = new Map<string, (value: number | PromiseLike<number>) => void>();
    private endpointName: string;

    constructor(
        private authTokenService: AuthTokenService,
        private sharedWorker: SharedWorkerService,
        private endpointService: HttpStreamEndpointService,
        private matSnackBar: MatSnackBar,
        private translate: TranslateService
    ) {
        this.autoupdateDataObservable = new Observable(dataSubscription => {
            this.sharedWorker.listenTo(`autoupdate`).subscribe(data => {
                if (data?.action === `receive-data` && data.content !== undefined) {
                    dataSubscription.next(data.content);
                } else if (data?.action === `receive-error`) {
                    if (data?.content?.data?.terminate) {
                        this.matSnackBar
                            .open(
                                this.translate.instant(`Error talking to autoupdate service`),
                                this.translate.instant(`Try reconnect`),
                                {
                                    duration: 0
                                }
                            )
                            .onAction()
                            .subscribe(() => {
                                this.sharedWorker.sendMessage(`autoupdate`, {
                                    action: `reconnect-inactive`
                                });
                            });
                    } else if (data?.content?.data?.reason === `HTTP error`) {
                        console.error(data);
                        if (data?.content?.data?.error.code === 403) {
                            this.setEndpoint();
                        }
                    }
                } else if (data?.action === `set-streamid` && this.openResolvers.has(data?.content?.requestHash)) {
                    this.openResolvers.get(data?.content?.requestHash)(data?.content?.streamId);
                    this.openResolvers.delete(data?.content?.requestHash);
                }
            });
        });

        this.authTokenService.accessTokenObservable.subscribe(() => {
            if (this.endpointName) {
                this.setEndpoint();
            }
        });

        this.registerConnectionStatusListener();
    }

    /**
     * Updates the endpoint used by the worker.
     * If no name is specified the last name this method was
     * called with will be used.
     *
     * @param name Name of the endpoint inside endpointService
     */
    public setEndpoint(name?: string) {
        this.endpointName = name || this.endpointName;
        const config = this.endpointService.getEndpoint(this.endpointName);

        this.sharedWorker.sendMessage(`autoupdate`, {
            action: `set-endpoint`,
            params: {
                authToken: this.authTokenService.rawAccessToken,
                url: config.url,
                healthUrl: config.healthUrl,
                method: config.method
            }
        });
    }

    /**
     * Tells the worker to open a new autoupdate subscription
     *
     * @param streamId The desired stream id (might be changed by worker)
     * @param description A description of the request
     * @param request The request data
     * @param params Additional url params
     */
    public open(streamId: Id | null, description: string, request: ModelRequest, params = {}): Promise<Id> {
        return new Promise(resolve => {
            const requestHash = djb2hash(JSON.stringify(request));
            this.openResolvers.set(requestHash, resolve);
            this.sharedWorker.sendMessage(`autoupdate`, {
                action: `open`,
                params: {
                    streamId,
                    description,
                    queryParams: formatQueryParams(params),
                    requestHash: requestHash,
                    request
                }
            });
        });
    }

    /**
     * Tells the worker the subscription is not needed anymore
     *
     * @param streamId Id of the stream
     */
    public close(streamId: Id) {
        this.sharedWorker.sendMessage(`autoupdate`, {
            action: `close`,
            params: {
                streamId
            }
        });
    }

    /**
     * @returns Observable containing messages from autoupdate
     */
    public listen(): Observable<any> {
        return this.autoupdateDataObservable;
    }

    private registerConnectionStatusListener() {
        addEventListener(`offline`, () => {
            this.sharedWorker.sendMessage(`autoupdate`, {
                action: `set-connection-status`,
                params: { status: `offline` }
            });
        });

        addEventListener(`online`, () => {
            this.sharedWorker.sendMessage(`autoupdate`, {
                action: `set-connection-status`,
                params: { status: `online` }
            });
        });
    }
}
