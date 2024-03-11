import { Id } from 'src/app/domain/definitions/key-types';

import { ModelRequest } from '../../domain/interfaces/model-request';
import { WorkerHttpAuth } from '../http/auth';
import { HTTP_POOL_CONFIG, HttpStreamPool } from '../http/http-stream-pool';
import { ErrorDescription, ErrorType, isCommunicationError, isCommunicationErrorWrapper } from '../http/stream-utils';
import { AutoupdateStream } from './autoupdate-stream';
import { AutoupdateSubscription } from './autoupdate-subscription';
import { AutoupdateSetEndpointParams } from './interfaces-autoupdate';

export class AutoupdateStreamPool extends HttpStreamPool<AutoupdateStream> {
    protected readonly messageSenderName: string = `autoupdate`;

    private subscriptions: Map<number, AutoupdateSubscription> = new Map<number, AutoupdateSubscription>();
    private get authToken(): Promise<string> {
        return WorkerHttpAuth.currentToken();
    }

    private _disableCompression = false;

    constructor(endpoint: AutoupdateSetEndpointParams) {
        super(endpoint);
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
     * Removes a stream and its subscriptions from the pool
     *
     * @param stream The stream to be removed
     */
    public override removeStream(stream: AutoupdateStream): void {
        for (const subscription of stream.subscriptions) {
            if (this.subscriptions[subscription.id]) {
                this.subscriptions.delete(subscription.id);
            }
        }

        super.removeStream(stream);
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

        if (userId !== undefined) {
            for (const stream of this.streams) {
                stream.clearSubscriptions();
                stream.restart();
            }
        }
    }

    protected async connectStream(stream: AutoupdateStream, force?: boolean): Promise<void> {
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
            }, HTTP_POOL_CONFIG.SINGLE_REQUEST_TEST_DELAY);
        });

        const singleWin = (await Promise.race([stream.receivedData, singleReceived, streamHandle])) === `single-win`;
        clearTimeout(streamStartTimeout);
        singleReqStream?.abort();

        (<any>self).useLongpolling = singleWin;
        if (singleWin) {
            this.sendToAll(`set-connection-mode`, `longpolling`);
            for (const stream of this.streams) {
                stream.updateConnectionMode();
            }
        }
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
            if (stream.failedConnects >= HTTP_POOL_CONFIG.RETRY_AMOUNT) {
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

        if (stream.failedConnects <= HTTP_POOL_CONFIG.RETRY_AMOUNT && error?.type !== ErrorType.CLIENT) {
            if (error?.error.content?.type === `auth`) {
                await WorkerHttpAuth.update();
            }

            await this.connectStream(stream);
        } else if (stream.failedConnects <= HTTP_POOL_CONFIG.RETRY_AMOUNT && error?.error.content?.type === `auth`) {
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
            stream.failedConnects === HTTP_POOL_CONFIG.RETRY_AMOUNT + 1 &&
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
            newStream.failedCounter = HTTP_POOL_CONFIG.RETRY_AMOUNT;
            this.streams.push(newStream);
            this.connectStream(newStream);
        }
    }
}
