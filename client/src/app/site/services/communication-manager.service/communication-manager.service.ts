import { Injectable } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';

import { HttpStream } from '../../../gateways/http-stream';
import { ConnectionStatusService } from '../connection-status.service';
import { LifecycleService } from '../lifecycle.service';
import { StreamHandler } from './stream-handler';

type CloseFn = () => void;
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
    private _isRunning = false;
    private _isAlive = false;

    private _activeStreamHandlers: { [id: number]: StreamHandler<any> } = {};

    public constructor(connectionStatus: ConnectionStatusService, lifecycleService: LifecycleService) {
        connectionStatus.offlineGone.subscribe(() => this.stopCommunication());
        connectionStatus.onlineGone.subscribe(() => this.startCommunication());
        if (lifecycleService.isBooted) {
            this.activateStreams();
        } else {
            lifecycleService.openslidesBooted.subscribe(() => {
                this.activateStreams();
            });
        }
        lifecycleService.openslidesShutdowned.subscribe(() => this.stopCommunication());
    }

    public registerStreamBuildFn<T>(
        buildFn: (streamId: number) => HttpStream<T>,
        streamId?: Id
    ): { closeFn: CloseFn; id: number } {
        const nextId = streamId || Math.floor(Math.random() * (900000 - 1) + 100000);
        this._activeStreamHandlers[nextId] = new StreamHandler(() => buildFn(nextId), {
            afterOpenedFn: stream => this.printStreamInformation(stream, `OPENED`),
            afterClosedFn: stream => this.printStreamInformation(stream, `CLOSED`)
        });
        if (this._isAlive) {
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

    private activateStreams(): void {
        this._isAlive = true;
        this.startCommunication();
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
        const openStreamsMap: { [streamId: number]: { id: number; description?: string; stream: HttpStream<any> } } =
            {};
        for (const streamHandler of Object.values(this._activeStreamHandlers)) {
            const stream = streamHandler.activeStream;
            if (stream) {
                openStreamsMap[stream.id] = { id: stream.id, description: stream.description, stream };
            }
        }
        console.log(Object.keys(openStreamsMap).length, `open streams:`, openStreamsMap);
    }
}
