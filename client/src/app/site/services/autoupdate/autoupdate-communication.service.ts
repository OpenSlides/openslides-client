import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subscriber } from 'rxjs';
import { Id } from 'src/app/domain/definitions/key-types';
import { HttpStreamEndpointService } from 'src/app/gateways/http-stream';
import { formatQueryParams } from 'src/app/infrastructure/definitions/http';
import { djb2hash } from 'src/app/infrastructure/utils';
import { SharedWorkerService } from 'src/app/openslides-main-module/services/shared-worker.service';
import {
    AutoupdateAuthChange,
    AutoupdateCloseStream,
    AutoupdateNewUser,
    AutoupdateOpenStream,
    AutoupdateReceiveData,
    AutoupdateReceiveError,
    AutoupdateReconnectInactive,
    AutoupdateSetConnectionStatus,
    AutoupdateSetEndpoint,
    AutoupdateSetStreamId,
    AutoupdateStatus
} from 'src/app/worker/interfaces-autoupdate';

import { AuthService } from '../auth.service';
import { AuthTokenService } from '../auth-token.service';
import { ConnectionStatusService } from '../connection-status.service';
import { ModelRequest } from './autoupdate.service';

@Injectable({
    providedIn: `root`
})
export class AutoupdateCommunicationService {
    private autoupdateDataObservable: Observable<any>;
    private openResolvers = new Map<string, (value: number | PromiseLike<number>) => void>();
    private endpointName: string;
    private autoupdateEndpointStatus: 'healthy' | 'unhealthy' = `healthy`;
    private unhealtyTimeout: any;
    private tryReconnectOpen: boolean = false;

    constructor(
        private authTokenService: AuthTokenService,
        private authService: AuthService,
        private sharedWorker: SharedWorkerService,
        private endpointService: HttpStreamEndpointService,
        private matSnackBar: MatSnackBar,
        private translate: TranslateService,
        private connectionStatusService: ConnectionStatusService
    ) {
        this.autoupdateDataObservable = new Observable(dataSubscription => {
            this.sharedWorker.listenTo(`autoupdate`).subscribe(msg => {
                switch (msg?.action) {
                    case `receive-data`:
                        this.handleReceiveData(<AutoupdateReceiveData>msg, dataSubscription);
                        break;
                    case `receive-error`:
                        this.handleReceiveError(<AutoupdateReceiveError>msg);
                        break;
                    case `set-streamid`:
                        this.handleSetStreamId(<AutoupdateSetStreamId>msg);
                        break;
                    case `status`:
                        this.handleStatus(<AutoupdateStatus>msg);
                        break;
                    case `new-user`:
                        this.authService.updateUser((<AutoupdateNewUser>msg).content?.id);
                        break;
                }
            });
        });

        this.authTokenService.accessTokenObservable.subscribe(() => {
            if (this.endpointName) {
                this.setEndpoint();
            }
        });

        this.authService.loginObservable.subscribe(() => {
            this.sharedWorker.sendMessage(`autoupdate`, {
                action: `auth-change`,
                params: {
                    type: `login`
                }
            } as AutoupdateAuthChange);
        });

        this.authService.logoutObservable.subscribe(() => {
            this.sharedWorker.sendMessage(`autoupdate`, {
                action: `auth-change`,
                params: {
                    type: `logout`
                }
            } as AutoupdateAuthChange);
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
    public setEndpoint(name?: string): void {
        this.endpointName = name || this.endpointName;
        const config = this.endpointService.getEndpoint(this.endpointName);

        this.sharedWorker.sendMessage(`autoupdate`, {
            action: `set-endpoint`,
            params: {
                url: config.url,
                healthUrl: config.healthUrl,
                method: config.method
            }
        } as AutoupdateSetEndpoint);
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
            } as AutoupdateOpenStream);
        });
    }

    /**
     * Tells the worker the subscription is not needed anymore
     *
     * @param streamId Id of the stream
     */
    public close(streamId: Id): void {
        this.sharedWorker.sendMessage(`autoupdate`, {
            action: `close`,
            params: {
                streamId
            }
        } as AutoupdateCloseStream);
    }

    /**
     * @returns Observable containing messages from autoupdate
     */
    public listen(): Observable<any> {
        return this.autoupdateDataObservable;
    }

    private registerConnectionStatusListener(): void {
        addEventListener(`offline`, () => {
            this.sharedWorker.sendMessage(`autoupdate`, {
                action: `set-connection-status`,
                params: { status: `offline` }
            } as AutoupdateSetConnectionStatus);
        });

        addEventListener(`online`, () => {
            this.sharedWorker.sendMessage(`autoupdate`, {
                action: `set-connection-status`,
                params: { status: `online` }
            } as AutoupdateSetConnectionStatus);
        });
    }

    private handleReceiveData(data: AutoupdateReceiveData, dataSubscription: Subscriber<any>): void {
        dataSubscription.next(data.content);
        if (this.tryReconnectOpen) {
            this.matSnackBar.dismiss();
            this.tryReconnectOpen = false;
        }
    }

    private handleReceiveError(data: AutoupdateReceiveError): void {
        if (data.content.data?.terminate) {
            this.tryReconnectOpen = true;
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
                    this.tryReconnectOpen = false;
                    this.sharedWorker.sendMessage(`autoupdate`, {
                        action: `reconnect-inactive`
                    } as AutoupdateReconnectInactive);
                });
        } else if (data.content.data?.reason === `HTTP error`) {
            console.error(data.content.data);
            const error = data.content?.data?.error;
            if (error.code === 403) {
                this.setEndpoint();
            }
        }
    }

    private handleSetStreamId(data: AutoupdateSetStreamId): void {
        if (!this.openResolvers.has(data.content?.requestHash)) {
            return;
        }

        this.openResolvers.get(data.content.requestHash)(data.content?.streamId);
        this.openResolvers.delete(data.content.requestHash);
    }

    private handleStatus(data: AutoupdateStatus): void {
        if (this.autoupdateEndpointStatus === data.content.status) {
            return;
        }

        this.autoupdateEndpointStatus = data.content.status;

        if (this.autoupdateEndpointStatus === `unhealthy`) {
            this.unhealtyTimeout = setTimeout(() => {
                this.connectionStatusService.goOffline({
                    reason: `Autoupdate unhealthy`,
                    isOnlineFn: () => {
                        return this.autoupdateEndpointStatus === `healthy`;
                    }
                });
            }, 1000);
        } else {
            clearTimeout(this.unhealtyTimeout);
        }
    }
}
