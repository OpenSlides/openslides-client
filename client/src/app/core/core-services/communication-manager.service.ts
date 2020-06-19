import { HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';

import { HttpService } from './http.service';
import { OfflineBroadcastService, OfflineReason } from './offline-broadcast.service';
import { SleepPromise } from '../promises/sleep';
import { StreamContainer, StreamingCommunicationService } from './streaming-communication.service';
import { Observable } from 'rxjs';
import { HTTPMethod } from '../definitions/http-methods';

type HttpParamsGetter = () => HttpParams | { [param: string]: string | string[] };
type HttpBodyGetter = () => any;

const MAX_CONNECTION_RETRIES = 3;
const MAX_STREAM_FAILURE_RETRIES = 1;

export class OfflineError extends Error {
    public constructor() {
        super('');
        this.name = 'OfflineError';
    }
}

@Injectable({
    providedIn: 'root'
})
export class CommunicationManagerService {
    private readonly _startCommunicationEvent = new EventEmitter<void>();

    private communicationAllowed = false;

    public get startCommunicationEvent(): Observable<void> {
        return this._startCommunicationEvent.asObservable();
    }

    private streamContainers: { [id: number]: StreamContainer } = {};

    private isOperatorAuthenticated = false;

    public constructor(
        private streamingCommunicationService: StreamingCommunicationService,
        private offlineBroadcastService: OfflineBroadcastService,
        private http: HttpService
    ) {
        this.offlineBroadcastService.goOfflineObservable.subscribe(() => this.closeConnections());
    }

    public async subscribe<T>(
        method: HTTPMethod,
        url: string,
        messageHandler: (message: T) => void,
        body?: HttpBodyGetter,
        params?: HttpParamsGetter
    ): Promise<() => void> {
        if (!params) {
            params = () => null;
        }

        const streamContainer = new StreamContainer(method, url, messageHandler, params, body);
        return await this.connectWithWrapper(streamContainer);
    }

    public startCommunication(): void {
        if (this.communicationAllowed) {
            console.error("Illegal state! DO not emit this event multiple times");
        } else {
            this.communicationAllowed = true;
            this._startCommunicationEvent.emit();
        }
    }

    private async connectWithWrapper(streamContainer: StreamContainer): Promise<() => void> {
        console.log("connect", streamContainer, streamContainer.stream);
        let retries = 0;
        const errorHandler = (error: any) => this.handleError(streamContainer, error);
        let gotError = true;
        while (gotError) {
            try {
                await this.streamingCommunicationService.subscribe(streamContainer, errorHandler);
                gotError = false;
            } catch (e) {
                retries++;
                console.log("retry nr.", retries);
                if (streamContainer.stream) {
                    streamContainer.stream.close();
                    streamContainer.stream = null;
                }
                if (retries < MAX_CONNECTION_RETRIES) {
                    console.log("retry reason: A");
                    await this.delayAndCheckReconnection();
                } else {
                    this.goOffline();
                    throw new OfflineError();
                }
            }
        }

        this.streamContainers[streamContainer.id] = streamContainer;
        return () => this.close(streamContainer);
    }

    private async handleError(streamContainer: StreamContainer, error: any): Promise<void> {
        console.log("handle Error", streamContainer, streamContainer.stream, error);
        streamContainer.stream.close();
        streamContainer.stream = null;

        streamContainer.hasErroredAmount++;
        if (streamContainer.hasErroredAmount > MAX_STREAM_FAILURE_RETRIES) {
            delete this.streamContainers[streamContainer.id];
            this.goOffline();
        } else {
            // retry it after some time:
            try {
                console.log("retry reason: B");
                await this.delayAndCheckReconnection();
                await this.connectWithWrapper(streamContainer);
            } catch (e) {
                // delayAndCheckReconnection may throw an OfflineError...
                // TODO: do we need these error above?
                // Also connectWithWrapper can throw an OfflineError. This one can be ignored.
            }
        }
    }

    private async delayAndCheckReconnection(): Promise<void> {
        const delay = Math.floor(Math.random() * 3000 + 2000);
        console.log(`retry again in ${delay} ms`);

        await SleepPromise(delay);

        // do not continue, if we are offline!
        if (this.offlineBroadcastService.isOffline()) {
            console.log('we are offline?');
            throw new OfflineError();
        }

        // do not continue, if we are offline!
        if (!this.shouldRetryConnecting()) {
            console.log('operator changed, do not rety');
            throw new OfflineError(); // TODO: This error is not really good....
        }
    }

    public closeConnections(): void {
        for (const streamWrapper of Object.values(this.streamContainers)) {
            if (streamWrapper.stream) {
                streamWrapper.stream.close();
            }
        }
        this.streamContainers = {};
        this.communicationAllowed = false;
    }

    public goOffline(): void {
        this.closeConnections(); // here we close the connections early.
        this.offlineBroadcastService.goOffline(OfflineReason.ConnectionLost);
    }

    private close(streamContainer: StreamContainer): void {
        if (this.streamContainers[streamContainer.id]) {
            this.streamContainers[streamContainer.id].stream.close();
            delete this.streamContainers[streamContainer.id];
        }
    }

    // Checks the operator: If we do not have a valid user,
    // do not even try to connect again..
    private shouldRetryConnecting(): boolean {
        return this.isOperatorAuthenticated
    }

    public setIsOperatorAuthenticated(isAuthenticated: boolean): void {
        this.isOperatorAuthenticated = isAuthenticated;
    }

    public async isCommunicationServiceOnline(): Promise<boolean> {
        try {
            const response = await this.http.get<{ healthy: boolean }>('/system/health');
            if (response.healthy) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
}
