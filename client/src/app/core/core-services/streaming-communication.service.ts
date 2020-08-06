import { Injectable } from '@angular/core';

import { EndpointConfiguration } from './http-stream-endpoint.service';
import { HttpStreamService, StreamContainer } from './http-stream.service';
import { HttpService } from './http.service';
import { OfflineBroadcastService, OfflineReasonValue } from './offline-broadcast.service';
import { SleepPromise } from '../promises/sleep';
import { AuthService } from './auth.service';

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
export class StreamingCommunicationService {
    private openStreams: { [id: number]: StreamContainer } = {};

    public constructor(
        private httpStreamService: HttpStreamService,
        private offlineBroadcastService: OfflineBroadcastService,
        private http: HttpService,
        private authService: AuthService
    ) {}

    public async connect(streamContainer: StreamContainer): Promise<() => void> {
        let retries = 0;
        const errorHandler = (error: any) => this.handleError(streamContainer, error);
        let success = false;
        while (!success) {
            try {
                await this.httpStreamService.connect(streamContainer, errorHandler);
                success = true;
            } catch (e) {
                retries++;
                if (streamContainer.stream) {
                    streamContainer.stream.close();
                    streamContainer.stream = null;
                }

                let goOffline = false;
                if (retries < MAX_CONNECTION_RETRIES) {
                    goOffline = !(await this.delayAndCheckReconnection());
                } else {
                    goOffline = true;
                }

                if (goOffline) {
                    this.goOffline(streamContainer.endpoint);
                    throw new OfflineError();
                }
            }
        }

        this.openStreams[streamContainer.id] = streamContainer;
        return () => this.close(streamContainer);
    }

    private async handleError(streamContainer: StreamContainer, error: any): Promise<void> {
        console.log('handle Error', streamContainer, streamContainer.stream, error);
        streamContainer.stream.close();
        streamContainer.stream = null;

        streamContainer.hasErroredAmount++;
        if (streamContainer.hasErroredAmount > MAX_STREAM_FAILURE_RETRIES) {
            delete this.openStreams[streamContainer.id];
            this.goOffline(streamContainer.endpoint);
        } else {
            // retry it after some time:
            try {
                if (await this.delayAndCheckReconnection()) {
                    await this.connect(streamContainer);
                }
            } catch (e) {
                // connect can throw an OfflineError. This one can be ignored.
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
        for (const streamWrapper of Object.values(this.openStreams)) {
            if (streamWrapper.stream) {
                streamWrapper.stream.close();
                streamWrapper.stream = null;
            }
        }
        this.openStreams = {};
    }

    private goOffline(endpoint: EndpointConfiguration): void {
        this.closeConnections(); // here we close the connections early.
        this.offlineBroadcastService.goOffline({
            type: OfflineReasonValue.ConnectionLost,
            endpoint: endpoint
        });
    }

    private close(streamContainer: StreamContainer): void {
        if (this.openStreams[streamContainer.id]) {
            this.openStreams[streamContainer.id].stream.close();
            delete this.openStreams[streamContainer.id];
        }
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
