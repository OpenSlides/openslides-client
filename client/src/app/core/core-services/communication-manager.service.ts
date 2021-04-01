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

class StreamContainerWithCloseFn extends StreamContainer {
    public closeFn: () => void;
}

/**
 * Main class for communication in streams with the server. You have to register an
 * endpoint to communicate with `registerEndpoint` and connect to it with `connect`.
 *
 * Note about some behaviours:
 * - The returned function must be called to close the stream.
 * - The connection attempt can block - internally we are waiting for the first message.
 *   If there is no first message, we'll wait...
 * TODO: not good. we want to cancel connection attempts
 * - The fact that `connect` returns does not mean, that we are connected. Maybe we are offline
 *   since offile-handling is managed by this service
 * - When going offline every connection is closed and attempted to reconnect when going
 *   online. This implies that for one connect, multiple requests can be done.
 *   -> Make sure that the streams are build in a way, that it handles reconnects.
 */
@Injectable({
    providedIn: 'root'
})
export class CommunicationManagerService {
    private isRunning = false;

    private requestedStreams: { [id: number]: StreamContainerWithCloseFn } = {};

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
        messageHandler: (message: T, streamId: number) => void,
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
            await this._connect(container);
        }

        console.log('Opened', container.description, container.id, container);
        this.printActiveStreams();

        return () => this.close(container);
    }

    private getStreamContainer<T>(
        endpoint: EndpointConfiguration,
        messageHandler: (message: T, streamId: number) => void,
        body: HttpBodyGetter,
        params?: HttpParamsGetter,
        description?: string
    ): StreamContainerWithCloseFn {
        let container;
        do {
            container = new StreamContainerWithCloseFn(endpoint, messageHandler, params, body, description);
        } while (this.requestedStreams[container.id]);
        return container;
    }

    private async _connect(container: StreamContainerWithCloseFn): Promise<void> {
        container.closeFn = await this.streamingCommunicationService.connect(container);
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

    private close(container: StreamContainerWithCloseFn): void {
        if (container.closeFn) {
            container.closeFn();
        }
        delete this.requestedStreams[container.id];

        console.log('Closed', container.description, container.id, container);
        this.printActiveStreams();
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
