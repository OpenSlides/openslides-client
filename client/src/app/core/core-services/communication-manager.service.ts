import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpStream } from './http-stream';
import { LifecycleService } from './lifecycle.service';
import { OfflineBroadcastService } from './offline-broadcast.service';

export type HttpParamsGetter = () => HttpParams | { [param: string]: string | string[] };
export type HttpBodyGetter = () => any;
export type CloseFn = () => void;

const LOG = true;

/**
 * Main class for communication in streams with the server. You have first to register an
 * endpoint to communicate with by calling `registerEndpoint` and connect to it with `connect`.
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
    providedIn: `root`
})
export class CommunicationManagerService {
    private isRunning = false;

    private activeStreams: { [id: number]: HttpStream<any> } = {};

    public constructor(
        private offlineBroadcastService: OfflineBroadcastService,
        private lifecycleService: LifecycleService
    ) {
        this.offlineBroadcastService.goOfflineEvent.subscribe(() => this.stopCommunication());
        this.offlineBroadcastService.goOnlineEvent.subscribe(() => this.startCommunication());
        this.lifecycleService.openslidesBooted.subscribe(() => this.startCommunication());
        this.lifecycleService.openslidesShutdowned.subscribe(() => this.stopCommunication());
    }

    public registerStream<T>(stream: HttpStream<T>): CloseFn {
        this.activeStreams[stream.id] = stream;
        if (this.isRunning) {
            stream.open();
        }
        if (LOG) {
            console.log(`OPENED`, stream.id, stream.description, stream);
            this.printActiveStreams();
        }
        return () => this.closeHttpStream(stream);
    }

    public startCommunication(): void {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;

        // Do not do it asynchronous blocking: just start everything up and do not care about the succeeding
        for (const stream of Object.values(this.activeStreams)) {
            stream.open();
        }
        if (LOG) {
            this.printActiveStreams();
        }
    }

    private stopCommunication(): void {
        this.isRunning = false;
        for (const stream of Object.values(this.activeStreams)) {
            stream.close();
        }
    }

    private closeHttpStream<T>(stream: HttpStream<T>): void {
        stream.close();
        delete this.activeStreams[stream.id];
        if (LOG) {
            console.log(`Closed`, stream.id);
            this.printActiveStreams();
        }
    }

    private printActiveStreams(): void {
        const streamIds = Object.keys(this.activeStreams)
            .map(id => +id)
            .sort();
        const openStreamsMap = {};
        for (const id of streamIds) {
            const stream = this.activeStreams[id];
            openStreamsMap[id] = { id, stream, description: stream.description };
        }
        console.log(streamIds.length, `open streams:`, openStreamsMap);
    }
}
