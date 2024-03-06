import { Id } from 'src/app/domain/definitions/key-types';

import { ModelRequest } from '../../domain/interfaces/model-request';
import {
    ErrorDescription,
    ErrorType,
    isCommunicationError,
    isCommunicationErrorWrapper
} from '../../gateways/http-stream/stream-utils';
import { WorkerHttpAuth } from '../http/auth';
import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateSubscription } from './autoupdate-subscription';
import {
    AutoupdateNewUserContent,
    AutoupdateSetEndpointParams,
    AutoupdateStatusContent
} from './interfaces-autoupdate';

const POOL_CONFIG = {
    RETRY_AMOUNT: 3,
    CONNECTION_LOST_CLOSE_TIMEOUT: 10000,
    SINGLE_REQUEST_TEST_DELAY: 5000
};

export class AutoupdateStreamPool {
    private onlineStatusStopTimeout: any;
    private streams: AutoupdateStream[] = [];
    private subscriptions: Map<number, AutoupdateSubscription> = new Map<number, AutoupdateSubscription>();
    private messagePorts: Set<MessagePort> = new Set<MessagePort>();
    private broadcast: (s: string, a: string, c?: any) => void = () => {};
    private get authToken(): Promise<string> {
        return WorkerHttpAuth.currentToken();
    }

    private _waitEndpointHealthyPromise: Promise<boolean> | null = null;
    private _disableCompression = false;

    public get activeStreams(): AutoupdateStream[] {
        return this.streams.filter(stream => stream.active);
    }

    constructor(private endpoint: AutoupdateSetEndpointParams) {
        WorkerHttpAuth.subscribe(`autoupdate-pool`, (token, uid?) => this.onAuthUpdate(token, uid));
    }

    /**
     * Opens a new stream with the specified subscriptions and params
     *
     * @param subscriptions
     * @param queryParams
     */
    public async openNewStream(
        subscriptions: AutoupdateSubscription[],
        queryParams: string
    ): Promise<AutoupdateStream> {
        for (const subscription of subscriptions) {
            this.subscriptions[subscription.id] = subscription;
        }

        const params = new URLSearchParams(queryParams);
        if (this._disableCompression) {
            params.delete(`compress`);
        }

        const stream = new AutoupdateStream(subscriptions, params, this.endpoint, await this.authToken);
        this.streams.push(stream);
        this.connectStream(stream);

        return stream;
    }

    /**
     * Resets fail counter and reconnect a stream
     * @throws if stream not in pool
     */
    public reconnect(stream: AutoupdateStream, force = true): void {
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
                for (const stream of this.streams) {
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
        for (const subscription of stream.subscriptions) {
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

        for (const stream of this.streams) {
            stream.updateEndpoint(this.endpoint);
        }
    }

    public registerBroadcast(broadcast: (s: string, a: string, c?: any) => void): void {
        this.broadcast = broadcast;
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
     * @param subscription Subscription to be managed by pool
     */
    public addSubscription(subscription: AutoupdateSubscription, stream: AutoupdateStream): void {
        subscription.stream = stream;
        stream.subscriptions.push(subscription);
        this.subscriptions[subscription.id] = subscription;
    }

    /**
     * Searches a subscription that fulfills the given queryParams
     * and modelRequest
     *
     * @param queryParams
     * @param modelRequest
     */
    public getMatchingSubscription(queryParams: string, modelRequest: ModelRequest): AutoupdateSubscription | null {
        for (const stream of this.streams) {
            for (const subscription of stream.subscriptions) {
                if (subscription.fulfills(queryParams, modelRequest)) {
                    return subscription;
                }
            }
        }

        return null;
    }

    public async disableCompression(): Promise<void> {
        this._disableCompression = true;
        for (const stream of this.streams) {
            stream.queryParams.delete(`compress`);
        }

        this.reconnectAll(false);
    }

    private onAuthUpdate(token: string, userId?: Id) {
        for (const stream of this.streams) {
            stream.setAuthToken(token);
        }

        if (userId) {
            this.sendToAll(`new-user`, {
                id: userId
            } as AutoupdateNewUserContent);

            for (const stream of this.streams) {
                stream.clearSubscriptions();
                stream.restart();
            }
        }
    }

    private async connectStream(stream: AutoupdateStream, force?: boolean): Promise<void> {
        if (WorkerHttpAuth.updating()) {
            await WorkerHttpAuth.updating();
        }

        const streamHandle = stream.start(force);
        if (
            !force &&
            (<any>self).useLongpolling === undefined &&
            !!stream.subscriptions.find(v => v.description === `organization_detail:subscription`)
        ) {
            await this.streamStartRace(stream, streamHandle);
        }

        const { stopReason, error } = await streamHandle;

        if (stopReason === `unused`) {
            this.removeStream(stream);
        } else if (stopReason === `error`) {
            await this.handleError(stream, error);
        } else if (stopReason === `resolved`) {
            const params = new URLSearchParams(stream.queryParams);
            if (+params.get(`position`) === 0 && !params.get(`single`)) {
                await this.handleResolve(stream);
            } else {
                this.removeStream(stream);
            }
        }
    }

    private async streamStartRace(stream: AutoupdateStream, streamHandle: Promise<any>): Promise<void> {
        let streamStartTimeout: any;
        let singleReqStream: AutoupdateStream;
        const singleReceived = new Promise<string>(r => {
            streamStartTimeout = setTimeout(() => {
                const params = new URLSearchParams(stream.queryParams);
                params.set(`single`, `1`);
                singleReqStream = stream.cloneWithSubscriptions(stream.subscriptions, params);
                singleReqStream.start();
                singleReqStream.receivedData.then(() => r(`single-win`));
            }, POOL_CONFIG.SINGLE_REQUEST_TEST_DELAY);
        });

        const singleWin = (await Promise.race([stream.receivedData, singleReceived, streamHandle])) === `single-win`;
        clearTimeout(streamStartTimeout);
        singleReqStream?.abort();

        (<any>self).useLongpolling = singleWin;
        if (singleWin) {
            this.broadcast(`autoupdate`, `set-connection-mode`, `longpolling`);
            for (const stream of this.streams) {
                stream.updateConnectionMode();
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

    /**
     * Return true if the endpoint was unhealty.
     */
    private waitUntilEndpointHealthy(): Promise<boolean> {
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

    /**
     * Handles an unexpected resolve and might restart a stream.
     * It is assumed that a resolve only ever happens in the following cases:
     * 1. Service got unavailable
     * 2. Session invalidated
     */
    private _handleResolvePromise: Promise<CallableFunction> = null;
    private async handleResolve(stream: AutoupdateStream): Promise<void> {
        if (this._handleResolvePromise) {
            const cb = await this._handleResolvePromise;
            await cb(stream);
            return;
        }

        this._handleResolvePromise = new Promise(async res => {
            let cb: CallableFunction;
            if (stream.failedConnects === POOL_CONFIG.RETRY_AMOUNT) {
                cb = (s: AutoupdateStream) => {
                    for (const subscription of s.subscriptions) {
                        subscription.sendError({
                            reason: `Repeated failure or client error`,
                            terminate: true
                        });
                    }
                };
            } else if (await this.waitUntilEndpointHealthy()) {
                cb = async (s: AutoupdateStream) => {
                    await this.connectStream(s);
                };
            } else if (await WorkerHttpAuth.update()) {
                cb = async (s: AutoupdateStream) => {
                    s.failedCounter++;
                    await this.connectStream(s);
                };
            } else {
                cb = (s: AutoupdateStream) => {
                    for (const subscription of s.subscriptions) {
                        subscription.sendError({
                            reason: `Logout`,
                            terminate: true
                        });
                    }
                };
            }
            res(cb);
            await cb(stream);
            setTimeout(() => (this._handleResolvePromise = null), 1000);
        });
        await this._handleResolvePromise;
    }

    private async handleError(stream: AutoupdateStream, error: any): Promise<void> {
        if (error?.error.content?.type !== `auth`) {
            await this.waitUntilEndpointHealthy();
        }

        if (stream.failedConnects <= POOL_CONFIG.RETRY_AMOUNT && error?.type !== ErrorType.CLIENT) {
            if (error?.error.content?.type === `auth`) {
                await WorkerHttpAuth.update();
            }

            await this.connectStream(stream);
        } else if (stream.failedConnects <= POOL_CONFIG.RETRY_AMOUNT && error?.error.content?.type === `auth`) {
            if (await WorkerHttpAuth.update()) {
                await this.connectStream(stream);
            } else {
                for (const subscription of stream.subscriptions) {
                    subscription.sendError({
                        reason: `Logout`,
                        terminate: true
                    });
                }
            }
        } else if (
            stream.failedConnects === POOL_CONFIG.RETRY_AMOUNT + 1 &&
            !(error instanceof ErrorDescription) &&
            (isCommunicationError(error) || isCommunicationErrorWrapper(error)) &&
            stream.subscriptions.length > 1
        ) {
            this.splitStream(stream);
        } else {
            for (const subscription of stream.subscriptions) {
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

        for (const subscription of stream.subscriptions) {
            const newStream = stream.cloneWithSubscriptions([subscription]);
            newStream.failedCounter = POOL_CONFIG.RETRY_AMOUNT;
            this.streams.push(newStream);
            this.connectStream(newStream);
        }
    }
}
