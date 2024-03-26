import { AutoupdateSetEndpointParams, AutoupdateStatusContent } from '../autoupdate/interfaces-autoupdate';
import { HttpStream } from './http-stream';

export const HTTP_POOL_CONFIG = {
    RETRY_AMOUNT: 3,
    CONNECTION_LOST_CLOSE_TIMEOUT: 10000,
    SINGLE_REQUEST_TEST_DELAY: 5000
};

export abstract class HttpStreamPool<T extends HttpStream> {
    protected abstract readonly messageSenderName: string;

    protected streams: T[] = [];

    private onlineStatusStopTimeout: any;
    private broadcast: (s: string, a: string, c?: any) => void = () => {};
    private _waitEndpointHealthyPromise: Promise<boolean> | null = null;

    public get activeStreams(): T[] {
        return this.streams.filter(stream => stream.active);
    }

    public constructor(protected endpoint: AutoupdateSetEndpointParams) {}

    protected abstract connectStream(stream: T, force?: boolean): Promise<void>;

    public registerBroadcast(broadcast: (s: string, a: string, c?: any) => void): void {
        this.broadcast = broadcast;
    }

    /**
     * Resets fail counter and reconnect a stream
     * @throws if stream not in pool
     */
    public reconnect(stream: T, force = true): void {
        if (!this.streams.includes(stream)) {
            throw new Error(`Stream not found`);
        }

        stream.failedCounter = 0;
        this.connectStream(stream, force);
    }

    /**
     * Resets fail counts and reconnects all streams
     */
    public reconnectAll(onlyInactive?: boolean): void {
        for (const stream of this.streams) {
            stream.failedCounter = 0;
            this.connectStream(stream, !onlyInactive);
        }
    }

    /**
     * Removes a stream from the pool
     *
     * @param stream The stream to be removed
     */
    public removeStream(stream: T): void {
        const idx = this.streams.indexOf(stream);
        if (idx !== -1) {
            this.streams.splice(idx, 1);
        }
    }

    /**
     * Closes streams when set offline after a certain time
     * and reopens them if set online
     *
     * @param online True for online, false for offline
     */
    public updateOnlineStatus(online: boolean): void {
        if (online) {
            clearTimeout(this.onlineStatusStopTimeout);
            this.reconnectAll(true);
            this.onlineStatusStopTimeout = undefined;
        } else if (!this.onlineStatusStopTimeout) {
            this.onlineStatusStopTimeout = setTimeout(() => {
                for (const stream of this.streams) {
                    stream.abort();
                }
            }, HTTP_POOL_CONFIG.CONNECTION_LOST_CLOSE_TIMEOUT);
        }
    }

    protected sendToAll(action: string, content?: any): void {
        this.broadcast(this.messageSenderName, action, content);
    }

    public async isEndpointHealthy(): Promise<boolean> {
        try {
            const data = await fetch(this.endpoint.healthUrl, {
                headers: {
                    'ngsw-bypass': true
                } as any,
                signal: AbortSignal.timeout(6000)
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }

                return { healthy: false };
            });

            return !!data?.healthy;
        } catch (e) {
            return false;
        }
    }

    /**
     * Return true if the endpoint was unhealty.
     */
    public waitUntilEndpointHealthy(): Promise<boolean> {
        if (!this._waitEndpointHealthyPromise) {
            this.sendToAll(`status`, {
                status: `unhealthy`
            } as AutoupdateStatusContent);
        }

        if (!this._waitEndpointHealthyPromise) {
            this._waitEndpointHealthyPromise = (async () => {
                let wasUnhealty = false;
                let timeout = 0;
                while (!(await this.isEndpointHealthy())) {
                    wasUnhealty = true;
                    timeout = Math.min(timeout + 1000, 10000);
                    await new Promise(f => setTimeout(f, timeout));
                }

                this._waitEndpointHealthyPromise = null;

                this.sendToAll(`status`, {
                    status: `healthy`
                } as AutoupdateStatusContent);
                return wasUnhealty;
            })();
        }

        return this._waitEndpointHealthyPromise;
    }
}
