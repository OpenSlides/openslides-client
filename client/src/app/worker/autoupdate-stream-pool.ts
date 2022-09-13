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

    private async connectStream(stream: AutoupdateStream, force?: boolean) {
        try {
            await stream.start(force);
        } catch (e) {}

        // TODO: Reconnect if not aborted
    }

    private splitStream(stream: AutoupdateStream) {
        stream.abort();
        const idx = this.streams.indexOf(stream);
        if (idx !== -1) {
            this.streams.splice(idx, 1);
        }

        for (let subscription of stream.subscriptions) {
            const newStream = stream.cloneWithSubscriptions([subscription]);
            newStream.failedCounter = 3;
            this.streams.push(newStream);
            this.connectStream(newStream);
        }
    }
}
