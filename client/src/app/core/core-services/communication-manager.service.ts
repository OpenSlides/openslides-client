import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HTTPMethod } from '../definitions/http-methods';
import { EndpointConfiguration, HttpStreamEndpointService } from './http-stream-endpoint.service';
import { StreamContainer } from './http-stream.service';
import { LifecycleService } from './lifecycle.service';
import { OfflineBroadcastService } from './offline-broadcast.service';
import { StreamingCommunicationService } from './streaming-communication.service';

type HttpParamsGetter = () => HttpParams | { [param: string]: string | string[] };
type HttpBodyGetter = () => any;

class StreamContainerWithCloseFn<T> extends StreamContainer<T> {
    public closeFn: () => void;
}

const LOG = true;

/**
 * Main class for communication in streams with the server. You have to register an
 * endpoint to communicate with `registerEndpoint` and connect to it with `connect`.
 *
 * Note about some behaviours:
 * - The returned function must be called to close the stream.
 * - The fact that `connect` returns does not mean, that we are connected. Maybe we are offline
 *   since offline-handling is managed by this service
 * - When going offline every connection is closed and attempted to reconnect when going
 *   online. This implies that for one connect, multiple requests can be done.
 *   -> Make sure that the streams are build in a way, that it handles reconnects.
 */
@Injectable({
    providedIn: 'root'
})
export class CommunicationManagerService {
    private isRunning = false;

    private requestedStreams: { [id: number]: StreamContainerWithCloseFn<any> } = {};

    public constructor(
        private streamingCommunicationService: StreamingCommunicationService,
        private offlineBroadcastService: OfflineBroadcastService,
        private lifecycleService: LifecycleService,
        private httpEndpointService: HttpStreamEndpointService
    ) {
        this.offlineBroadcastService.goOfflineObservable.subscribe(() => this.stopCommunication());
        this.offlineBroadcastService.goOnlineObservable.subscribe(() => this.startCommunication());
        this.lifecycleService.openslidesBooted.subscribe(() => this.startCommunication());
        this.lifecycleService.openslidesShutdowned.subscribe(() => this.stopCommunication());
    }

    public registerEndpoint(name: string, url: string, healthUrl: string, method?: HTTPMethod): void {
        this.httpEndpointService.registerEndpoint(name, url, healthUrl, method);
    }

    public async connect<T>(
        endpointName: string,
        messageHandler: (message: T, streamId: number, isFirstResponse: boolean) => void,
        body: HttpBodyGetter,
        params: HttpParamsGetter,
        description: string
    ): Promise<() => void> {
        if (!params) {
            params = () => null;
        }

        const endpoint = this.httpEndpointService.getEndpoint(endpointName);
        const container = this.getStreamContainer(endpoint, messageHandler, body, params, description);
        this.requestedStreams[container.id] = container;

        if (this.isRunning) {
            this._connect(container);
        }

        if (LOG) {
            console.log('Opened', container.description, container.id, container);
            this.printActiveStreams();
        }

        return () => this.close(container);
    }

    private getStreamContainer<T>(
        endpoint: EndpointConfiguration,
        messageHandler: (message: T, streamId: number, isFirstResponse: boolean) => void,
        body: HttpBodyGetter,
        params?: HttpParamsGetter,
        description?: string
    ): StreamContainerWithCloseFn<T> {
        let container;
        do {
            container = new StreamContainerWithCloseFn(endpoint, messageHandler, params, body, description);
        } while (this.requestedStreams[container.id]);
        return container;
    }

    private _connect<T>(container: StreamContainerWithCloseFn<T>): void {
        container.closeFn = this.streamingCommunicationService.connect(container);
    }

    public startCommunication(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;

        // Do not do it asynchronous blocking: just start everything up and do not care about the succeeding
        for (const container of Object.values(this.requestedStreams)) {
            this._connect(container);
        }
    }

    private stopCommunication(): void {
        this.isRunning = false;
        this.streamingCommunicationService.closeConnections();
        for (const container of Object.values(this.requestedStreams)) {
            if (container.stream) {
                container.stream.close();
            }
            container.stream = null;
            this.close(container);
        }
    }

    private close<T>(container: StreamContainerWithCloseFn<T>): void {
        if (container.closeFn) {
            container.closeFn();
        }
        delete this.requestedStreams[container.id];

        if (LOG) {
            console.log('Closed', container.description, container.id, container);
            this.printActiveStreams();
        }
    }

    private printActiveStreams(): void {
        const ids = Object.keys(this.requestedStreams)
            .map(id => +id)
            .sort();
        const containerMap = {};
        for (const id of ids) {
            const container = this.requestedStreams[id];
            containerMap[id] = { id, description: container.description, body: container.body?.(), container };
        }
        console.log(ids.length, 'open streams:', containerMap);
    }
}
