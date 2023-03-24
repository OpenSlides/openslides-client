import { environment } from 'src/environments/environment';

import { ModelRequest } from '../domain/interfaces/model-request';
import {
    ErrorDescription,
    ErrorType,
    isCommunicationError,
    isCommunicationErrorWrapper
} from '../gateways/http-stream/stream-utils';
import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateSubscription } from './autoupdate-subscription';
import {
    AutoupdateNewUserContent,
    AutoupdateSetEndpointParams,
    AutoupdateStatusContent
} from './interfaces-autoupdate';

const POOL_CONFIG = {
    RETRY_AMOUNT: 3,
    CONNECTION_LOST_CLOSE_TIMEOUT: 10000
};

export class AutoupdateStreamPool {
    private onlineStatusStopTimeout: any;
    private streams: AutoupdateStream[] = [];
    private subscriptions: Map<number, AutoupdateSubscription> = new Map<number, AutoupdateSubscription>();
    private messagePorts: Set<MessagePort> = new Set<MessagePort>();
    private authToken: string = undefined;
    private currentUserId: number = undefined;

    private _waitEndpointHealthyPromise: Promise<void> | null = null;
    private _authTokenRefreshTimeout: any | null = null;
    private _updateAuthPromise: Promise<void> | undefined;
    private _waitingForUpdateAuthPromise: boolean = false;
    private _disableCompression: boolean = false;

    public get activeStreams(): AutoupdateStream[] {
        return this.streams.filter(stream => stream.active);
    }

    constructor(private endpoint: AutoupdateSetEndpointParams) {
        this.updateAuthentication();
    }

    /**
     * Opens a new stream with the specified subscriptions and params
     *
     * @param subscriptions
     * @param queryParams
     */
    public openNewStream(subscriptions: AutoupdateSubscription[], queryParams: string): AutoupdateStream {
        for (let subscription of subscriptions) {
            this.subscriptions[subscription.id] = subscription;
        }

        const params = new URLSearchParams(queryParams);
        if (this._disableCompression) {
            params.delete(`compress`);
        }

        const stream = new AutoupdateStream(subscriptions, params, this.endpoint, this.authToken);
        this.streams.push(stream);
        this.connectStream(stream);

        return stream;
    }

    /**
     * Resets fail counter and reconnect a stream
     * @throws if stream not in pool
     */
    public reconnect(stream: AutoupdateStream): void {
        if (!this.streams.includes(stream)) {
            throw new Error(`Stream not found`);
        }

        stream.failedCounter = 0;
        this.connectStream(stream, true);
    }

    /**
     * Resets fail counts and reconnects all streams
     */
    public reconnectAll(onlyInactive?: boolean): void {
        for (let stream of this.streams) {
            stream.failedCounter = 0;
            this.connectStream(stream, !onlyInactive);
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
        } else {
            this.onlineStatusStopTimeout = setTimeout(() => {
                for (let stream of this.streams) {
                    stream.abort();
                }
            }, POOL_CONFIG.CONNECTION_LOST_CLOSE_TIMEOUT);
        }
    }

    /**
     * Removes a stream and its subscriptions from the pool
     *
     * @param stream The stream to be removed
     */
    public removeStream(stream: AutoupdateStream): void {
        for (let subscription of stream.subscriptions) {
            if (this.subscriptions[subscription.id]) {
                this.subscriptions.delete(subscription.id);
            }
        }

        const idx = this.streams.indexOf(stream);
        if (idx !== -1) {
            this.streams.splice(idx, 1);
        }
    }

    /**
     * Updates the given endpoint for all managed streams
     *
     * @param endpoint The new endpoint configuration
     */
    public setEndpoint(endpoint: AutoupdateSetEndpointParams): void {
        if (JSON.stringify(this.endpoint) === JSON.stringify(endpoint)) {
            return;
        }

        this.endpoint = Object.assign(this.endpoint, endpoint);

        for (let stream of this.streams) {
            stream.updateEndpoint(this.endpoint);
        }
    }

    /**
     * @param subscriptionId Id of the subscription
     *
     * @returns subscription with given id or null
     */
    public getSubscriptionById(subscriptionId: number): AutoupdateSubscription | null {
        return this.subscriptions[subscriptionId] || null;
    }

    /**
     * Searches a subscription that fulfills the given queryParams
     * and modelRequest
     *
     * @param queryParams
     * @param modelRequest
     */
    public getMatchingSubscription(queryParams: string, modelRequest: ModelRequest): AutoupdateSubscription | null {
        for (let stream of this.streams) {
            for (let subscription of stream.subscriptions) {
                if (subscription.fulfills(queryParams, modelRequest)) {
                    return subscription;
                }
            }
        }

        return null;
    }

    /**
     * Updates the auth token
     */
    public async updateAuthentication(): Promise<void> {
        const currentPromise = this._updateAuthPromise;

        if (this._waitingForUpdateAuthPromise) {
            await this._updateAuthPromise;
            return;
        }

        this._updateAuthPromise = new Promise(async resolve => {
            if (currentPromise) {
                this._waitingForUpdateAuthPromise = true;
                await currentPromise;
                this._waitingForUpdateAuthPromise = false;
            }

            try {
                clearTimeout(this._authTokenRefreshTimeout);
                const res = await fetch(`/${environment.authUrlPrefix}/who-am-i/`, {
                    method: `POST`,
                    headers: {
                        'ngsw-bypass': true
                    } as any
                });
                const json = await res.json();
                if (json?.success) {
                    this.setAuthToken(res.headers.get(`authentication`) || null);
                } else if (!res.ok && json?.message === `Not signed in`) {
                    this.setAuthToken(null);
                }
                resolve();
            } catch (e) {}
        });

        await this._updateAuthPromise;
    }

    public async disableCompression(): Promise<void> {
        this._disableCompression = true;
        for (let stream of this.streams) {
            stream.queryParams.delete(`compress`);
        }

        this.reconnectAll(false);
    }

    private setAuthToken(token: string | null): void {
        const lastUserId = this.currentUserId;
        this.authToken = token;

        for (let stream of this.streams) {
            stream.setAuthToken(this.authToken);
        }

        if (this.authToken) {
            const payload = atob(this.authToken.split(`.`)[1]);
            const token = JSON.parse(payload);
            const issuedAt = new Date().getTime(); // in ms
            const expiresAt = token.exp; // in sec
            this.currentUserId = token.userId;
            this._authTokenRefreshTimeout = setTimeout(() => {
                this.updateAuthentication();
            }, expiresAt * 1000 - issuedAt - 100); // 100ms before token is invalid
        } else {
            this.currentUserId = null;
        }

        if (lastUserId !== undefined && this.currentUserId !== lastUserId) {
            this.sendToAll(`new-user`, {
                id: this.currentUserId
            } as AutoupdateNewUserContent);

            for (let stream of this.streams) {
                stream.clearSubscriptions();
                stream.restart();
            }
        }
    }

    private async connectStream(stream: AutoupdateStream, force?: boolean): Promise<void> {
        if (this._updateAuthPromise) {
            await this._updateAuthPromise;
        }

        const { stopReason, error } = await stream.start(force);

        if (stopReason === `unused`) {
            this.removeStream(stream);
        } else if (stopReason === `error`) {
            await this.handleError(stream, error);
        } else if (stopReason === `resolved`) {
            let params = new URLSearchParams(stream.queryParams);
            if (+params.get(`position`) === 0 && !params.get(`single`)) {
                await this.handleError(stream, null);
            } else {
                this.removeStream(stream);
            }
        }
    }

    private async isEndpointHealthy(): Promise<boolean> {
        try {
            const data = await fetch(this.endpoint.healthUrl, {
                headers: {
                    'ngsw-bypass': true
                } as any
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

    private updateMessagePorts(): void {
        const updatedPorts = new Set<MessagePort>();
        for (const stream of this.streams) {
            for (const subscription of stream.subscriptions) {
                for (const port of subscription.ports) {
                    updatedPorts.add(port);
                }
            }
        }

        this.messagePorts = updatedPorts;
    }

    private sendToAll(action: string, content?: any): void {
        // TODO: This in inefficient, but as long as this is only used by
        // waitUntilEndpointHealthy this should not be a problem.
        // If we need this for other things that happen more frequently
        // we need to implement a management mechanism for MessagePorts
        this.updateMessagePorts();

        for (const port of this.messagePorts) {
            port.postMessage({
                sender: `autoupdate`,
                action,
                content
            });
        }
    }

    private waitUntilEndpointHealthy(): Promise<void> {
        if (!this._waitEndpointHealthyPromise) {
            this.sendToAll(`status`, {
                status: `unhealthy`
            } as AutoupdateStatusContent);
        }

        if (!this._waitEndpointHealthyPromise) {
            this._waitEndpointHealthyPromise = (async () => {
                let timeout = 0;
                while (!(await this.isEndpointHealthy())) {
                    timeout = Math.min(timeout + 1000, 10000);
                    await new Promise(f => setTimeout(f, timeout));
                }

                this._waitEndpointHealthyPromise = null;

                this.sendToAll(`status`, {
                    status: `healthy`
                } as AutoupdateStatusContent);
            })();
        }

        return this._waitEndpointHealthyPromise;
    }

    private async handleError(stream: AutoupdateStream, error: any): Promise<void> {
        if (error?.error.content?.type !== `auth`) {
            await this.waitUntilEndpointHealthy();
        }

        if (stream.failedConnects <= POOL_CONFIG.RETRY_AMOUNT && error?.reason !== ErrorType.CLIENT) {
            if (error?.error.content?.type === `auth`) {
                await this.updateAuthentication();
            }

            await this.connectStream(stream);
        } else if (
            stream.failedConnects === POOL_CONFIG.RETRY_AMOUNT + 1 &&
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

    private splitStream(stream: AutoupdateStream): void {
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
