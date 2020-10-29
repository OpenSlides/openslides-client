import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';
import { EndpointConfiguration } from './http-stream-endpoint.service';
import { HttpStreamService, StreamContainer } from './http-stream.service';
import { HttpService } from './http.service';
import { OfflineBroadcastService, OfflineReasonValue } from './offline-broadcast.service';
import { SleepPromise } from '../promises/sleep';

const MAX_CONNECTION_RETRIES = 3;
const MAX_STREAM_FAILURE_RETRIES = 1;

@Injectable({
    providedIn: 'root'
})
export class StreamingCommunicationService {
    private streams: { [id: number]: StreamContainer } = {};

    public constructor(
        private httpStreamService: HttpStreamService,
        private offlineBroadcastService: OfflineBroadcastService,
        private http: HttpService,
        private authService: AuthService
    ) {}

    public async connect(streamContainer: StreamContainer): Promise<() => void> {
        streamContainer.retries = 0;
        streamContainer.errorHandler = (error: any) => this.handleError(streamContainer, error);
        return await this._connect(streamContainer);
    }

    public async _connect(streamContainer: StreamContainer): Promise<() => void> {
        this.streams[streamContainer.id] = streamContainer;
        try {
            await this.httpStreamService.connect(streamContainer);
        } catch (e) {
            setTimeout(() => {
                this.handleConnectionError(streamContainer);
            }, 0);
        }
        return () => this.close(streamContainer);
    }

    private async handleConnectionError(streamContainer: StreamContainer): Promise<void> {
        streamContainer.retries++;
        if (streamContainer.stream) {
            streamContainer.stream.close();
            streamContainer.stream = null;
        }

        let goOffline = false;
        if (streamContainer.retries < MAX_CONNECTION_RETRIES) {
            goOffline = !(await this.delayAndCheckReconnection());
        } else {
            goOffline = true;
        }

        if (goOffline) {
            this.goOffline(streamContainer.endpoint);
            return;
        }

        if (this.isStreamOpen(streamContainer)) {
            this._connect(streamContainer);
        }
    }

    private async handleError(streamContainer: StreamContainer, error: any): Promise<void> {
        console.log('handle Error', streamContainer, streamContainer.stream, error);
        streamContainer.stream.close();
        streamContainer.stream = null;

        streamContainer.hasErroredAmount++;
        if (streamContainer.hasErroredAmount > MAX_STREAM_FAILURE_RETRIES) {
            delete this.streams[streamContainer.id];
            this.goOffline(streamContainer.endpoint);
        } else {
            // retry it after some time:
            if (await this.delayAndCheckReconnection()) {
                await this.connect(streamContainer);
            }
        }
    }

    /**
     * Returns true, if a reconnect attempt should be done.
     */
    private async delayAndCheckReconnection(): Promise<boolean> {
        const delay = Math.floor(Math.random() * 3000 + 2000);
        console.log(`retry again in ${delay} ms`);

        await SleepPromise(delay);

        // do not continue, if we are offline!
        if (this.offlineBroadcastService.isOffline()) {
            console.log('we are offline?');
            return false;
        }

        // do not continue, if the operator changed!
        if (!this.shouldRetryConnecting()) {
            console.log('operator changed, do not rety');
            return false;
        }

        return true;
    }

    public closeConnections(): void {
        for (const streamWrapper of Object.values(this.streams)) {
            if (streamWrapper.stream) {
                streamWrapper.stream.close();
                streamWrapper.stream = null;
            }
        }
        this.streams = {};
    }

    private goOffline(endpoint: EndpointConfiguration): void {
        this.closeConnections(); // here we close the connections early.
        this.offlineBroadcastService.goOffline({
            type: OfflineReasonValue.ConnectionLost,
            endpoint: endpoint
        });
    }

    private close(streamContainer: StreamContainer): void {
        if (this.isStreamOpen(streamContainer)) {
            this.streams[streamContainer.id].stream.close();
            delete this.streams[streamContainer.id];
        }
    }

    private isStreamOpen(streamContainer: StreamContainer): boolean {
        return !!this.streams[streamContainer.id];
    }

    // Checks the operator: If we do not have a valid user,
    // do not even try to connect again..
    private shouldRetryConnecting(): boolean {
        return this.authService.isAuthenticated();
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
