import { ErrorDescription, ErrorType, isCommunicationError, isCommunicationErrorWrapper } from '../gateways/http-stream/stream-utils';
import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateSubscription } from './autoupdate-subscription';

const POOL_CONFIG = {
    RETRY_AMOUNT: 3,
    CONNECTION_LOST_CLOSE_TIMEOUT: 10000
};

export class AutoupdateStreamPool {
    private onlineStatusStopTimeout: any;
    private streams: AutoupdateStream[] = [];
    private subscriptions: { [key: number]: AutoupdateSubscription } = {};

    constructor(
        private endpoint: {
            url: string;
            healthUrl: string;
            method: string;
            authToken: string;
        }
    ) {}

    public openNewStream(subscriptions: AutoupdateSubscription[], queryParams: string): AutoupdateStream {
        for (let subscription of subscriptions) {
            this.subscriptions[subscription.id] = subscription;
        }

        const stream = new AutoupdateStream(subscriptions, queryParams, this.endpoint);
        this.streams.push(stream);
        this.connectStream(stream);

        return stream;
    }

    /**
     * Resets fail counts and reconnects all streams
     */
    public reconnectAll(onlyInactive?: boolean) {
        for (let stream of this.streams) {
            stream.failedCounter = 0;
            this.connectStream(stream, !onlyInactive);
        }
    }

    public updateOnlineStatus(online: boolean) {
        if (online) {
            clearTimeout(this.onlineStatusStopTimeout);
            this.reconnectAll(true);
        } else {
            this.onlineStatusStopTimeout = setTimeout(() => {
                for (let stream of this.streams) {
                    stream.abort();
                }
            }, POOL_CONFIG.CONNECTION_LOST_CLOSE_TIMEOUT);
        }
    }

    public removeStream(stream: AutoupdateStream) {
        for (let subscription of stream.subscriptions) {
            if (this.subscriptions[subscription.id]) {
                delete this.subscriptions[subscription.id];
            }
        }

        const idx = this.streams.indexOf(stream);
        if (idx !== -1) {
            this.streams.splice(idx, 1);
        }
    }

    public setEndpoint(endpoint: { url?: string; healthUrl?: string; method?: string; authToken?: string }) {
        this.endpoint = Object.assign(this.endpoint, endpoint);

        for (let stream of this.streams) {
            stream.updateEndpoint(this.endpoint);
        }
    }

    public getSubscriptionById(subscriptionId: number): AutoupdateSubscription | null {
        return this.subscriptions[subscriptionId] || null;
    }

    public getMatchingSubscription(queryParams: string, modelRequest: Object): AutoupdateSubscription | null {
        for (let stream of this.streams) {
            for (let subscription of stream.subscriptions) {
                if (subscription.fulfills(queryParams, modelRequest)) {
                    return subscription;
                }
            }
        }

        return null;
    }

    private async connectStream(stream: AutoupdateStream, force?: boolean): Promise<void> {
        const { stopReason, error } = await stream.start(force);

        if (stopReason === `unused`) {
            this.removeStream(stream);
        } else if (stopReason === `error`) {
            await this.handleError(stream, error);
        } else if (stopReason === `resolved`) {
            await this.handleError(stream, undefined);
        }
    }

    private async isEndpointHealthy(): Promise<boolean> {
        const data = await fetch(this.endpoint.healthUrl).then(response => {
            if (response.ok) {
                return response.json();
            }

            return { healthy: false };
        });

        return !!data?.healthy;
    }

    private async waitUntilEndpointHealthy(): Promise<void> {
        // TODO: collect waits and do only one health check
        while(!(await this.isEndpointHealthy())) {
            await new Promise(f => setTimeout(f, 3000));
        }
    }

    private async handleError(stream: AutoupdateStream, error: any): Promise<void> {
        await this.waitUntilEndpointHealthy();


        if (stream.failedConnects <= 3 && error?.reason !== ErrorType.CLIENT) {
            await this.connectStream(stream);
        } else if (
            stream.failedConnects === 4 &&
            !(error instanceof ErrorDescription) &&
            (isCommunicationError(error) || isCommunicationErrorWrapper(error)) &&
            stream.subscriptions.length > 1
        ) {
            this.splitStream(stream);
        } else {
            for (let subscription of stream.subscriptions) {
                subscription.sendError({
                    reason: `Repeated failure or client error`,
                    terminate: true
                });
            }
        }
    }

    private splitStream(stream: AutoupdateStream) {
        stream.abort();
        const idx = this.streams.indexOf(stream);
        if (idx !== -1) {
            this.streams.splice(idx, 1);
        }

        for (let subscription of stream.subscriptions) {
            const newStream = stream.cloneWithSubscriptions([subscription]);
            newStream.failedCounter = POOL_CONFIG.RETRY_AMOUNT;
            this.streams.push(newStream);
            this.connectStream(newStream);
        }
    }
}
