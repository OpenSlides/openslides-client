import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpStream } from './http-stream';
import { LifecycleService } from './lifecycle.service';
import { OfflineService } from './offline.service';

export type HttpParamsGetter = () => HttpParams | { [param: string]: string | string[] };
export type HttpBodyGetter = () => any;
export type CloseFn = () => void;

const LOG = true;

class StreamHandler<T> {
    public get activeStream(): HttpStream<T> | null {
        return this._currentActiveStream;
    }

    private _currentActiveStream: HttpStream<T> | null = null;

    private readonly _afterOpenedFn: (stream: HttpStream<T>) => void;
    private readonly _afterClosedFn: (stream: HttpStream<T>) => void;

    public constructor(
        private readonly buildStreamFn: () => HttpStream<T>,
        readonly config: {
            afterOpenedFn?: (stream: HttpStream<T>) => void;
            afterClosedFn?: (stream: HttpStream<T>) => void;
        } = {}
    ) {
        this._afterOpenedFn = config.afterOpenedFn;
        this._afterClosedFn = config.afterClosedFn;
    }

    public closeCurrentStream(): void {
        const stream = this._currentActiveStream;
        this._currentActiveStream?.close();
        this._currentActiveStream = null;
        if (this._afterClosedFn) {
            this._afterClosedFn(stream);
        }
    }

    public openCurrentStream(): void {
        if (!this._currentActiveStream) {
            this.build();
        }
        this._currentActiveStream.open();
        if (this._afterOpenedFn) {
            this._afterOpenedFn(this._currentActiveStream);
        }
    }

    private build(): void {
        this._currentActiveStream = this.buildStreamFn();
    }
}

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
    private _isRunning = false;

    private _activeStreamHandlers: { [id: number]: StreamHandler<any> } = {};

    public constructor(offlineService: OfflineService, lifecycleService: LifecycleService) {
        offlineService.offlineGone.subscribe(() => this.stopCommunication());
        offlineService.onlineGone.subscribe(() => this.startCommunication());
        lifecycleService.openslidesBooted.subscribe(() => this.startCommunication());
        lifecycleService.openslidesShutdowned.subscribe(() => this.stopCommunication());
    }

    public registerStreamBuildFn<T>(buildFn: (streamId: number) => HttpStream<T>): { closeFn: CloseFn; id: number } {
        const nextId = Math.floor(Math.random() * (900000 - 1) + 100000);
        this._activeStreamHandlers[nextId] = new StreamHandler(() => buildFn(nextId), {
            afterOpenedFn: stream => this.printStreamInformation(stream, `OPENED`),
            afterClosedFn: stream => this.printStreamInformation(stream, `CLOSED`)
        });
        if (this._isRunning) {
            this._activeStreamHandlers[nextId].openCurrentStream();
        }
        return {
            closeFn: () => {
                this._activeStreamHandlers[nextId].closeCurrentStream();
                delete this._activeStreamHandlers[nextId];
            },
            id: nextId
        };
    }

    private startCommunication(): void {
        if (this._isRunning) {
            return;
        }

        this._isRunning = true;

        // Do not do it asynchronous blocking: just start everything up and do not care about the succeeding
        for (const streamHandler of Object.values(this._activeStreamHandlers)) {
            streamHandler.openCurrentStream();
        }
        if (LOG) {
            this.printActiveStreams();
        }
    }

    private stopCommunication(): void {
        this._isRunning = false;
        for (const streamHandler of Object.values(this._activeStreamHandlers)) {
            streamHandler.closeCurrentStream();
        }
        if (LOG) {
            this.printActiveStreams();
        }
    }

    private printStreamInformation(stream: HttpStream<any>, description: string): void {
        if (LOG && stream) {
            console.log(description, stream.id, stream.description);
            this.printActiveStreams();
        }
    }

    private printActiveStreams(): void {
        const openStreamsMap = {};
        for (const streamHandler of Object.values(this._activeStreamHandlers)) {
            const stream = streamHandler.activeStream;
            if (stream) {
                openStreamsMap[stream.id] = { id: stream.id, description: stream.description, stream };
            }
        }
        console.log(Object.keys(openStreamsMap).length, `open streams:`, openStreamsMap);
    }
}
