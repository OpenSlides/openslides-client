import {
    ErrorDescription,
    isCommunicationError,
    isCommunicationErrorWrapper
} from '../../gateways/http-stream/stream-utils';
import { AutoupdateSetEndpointParams } from '../autoupdate/interfaces-autoupdate';
import { HttpSubscription, HttpSubscriptionCallbacks, HttpSubscriptionEndpoint } from './http-subscription';
import { HttpSubscriptionPolling } from './http-subscription-polling';
import { HttpSubscriptionSSE } from './http-subscription-sse';

export abstract class HttpStream {
    public failedCounter = 0;

    protected supportLongpolling = true;
    protected connectionMode: 'SSE' | 'LONGPOLLING' = `SSE`;
    protected subscription: HttpSubscription;

    private lastError: any | ErrorDescription = null;
    private restarting = false;
    private stopping = false;

    private endpointConfig: HttpSubscriptionEndpoint;
    private handlerConfig: HttpSubscriptionCallbacks;

    public get active(): boolean {
        return this.subscription.active;
    }

    private _receivedData: Promise<void>;
    private _receivedDataResolver: CallableFunction;
    public get receivedData(): Promise<void> {
        return this._receivedData;
    }

    public get failedConnects(): number {
        return this.failedCounter;
    }

    constructor(
        queryParams: URLSearchParams,
        endpoint: AutoupdateSetEndpointParams,
        authToken: string,
        requestPayload?: string
    ) {
        this.endpointConfig = {
            url: queryParams ? endpoint.url + `?` + queryParams : endpoint.url,
            method: endpoint.method,
            authToken,
            payload: requestPayload
        };
        this.handlerConfig = {
            onData: (data: unknown) => this.handleContent(data),
            onError: (data: unknown) => this.handleError(data)
        };

        this.resetReceivedData();
        this.updateConnectionMode();
    }

    /**
     * Closes the stream
     */
    public async abort(): Promise<void> {
        this.stopping = true;
        this.resetReceivedData();
        await this.subscription.stop();
    }

    /**
     * Opens a new connection to autoupdate.
     * Also this function registers this stream inside all subscriptions
     * handled by this stream.
     *
     * resolves when fetch connection is closed
     */
    public async start(
        force?: boolean
    ): Promise<{ stopReason: 'error' | 'aborted' | 'resolved' | 'in-use' | string; error?: any }> {
        if (this.subscription.active && !force) {
            return { stopReason: `in-use` };
        } else if (this.subscription.active && force) {
            await this.abort();
        }

        this.restarting = false;
        this.stopping = false;
        this.lastError = null;
        try {
            await this.subscription.start();
        } catch (e) {
            if (e.name !== `AbortError`) {
                console.error(e);

                return { stopReason: `error`, error: null };
            } else if (this.restarting) {
                return await this.start();
            }

            return { stopReason: `aborted` };
        }

        if (this.lastError) {
            return { stopReason: `error`, error: this.lastError };
        }

        if (this.restarting) {
            return await this.start();
        }

        return { stopReason: this.stopping ? `aborted` : `resolved` };
    }

    public async restart(): Promise<void> {
        this.restarting = true;
        await this.subscription.stop();
    }

    public async updateConnectionMode(): Promise<void> {
        const oldSubscription = this.subscription;
        if ((<any>self).useLongpolling && this.supportLongpolling && this.connectionMode === `SSE`) {
            this.connectionMode = `LONGPOLLING`;
        } else if (this.subscription) {
            return;
        }

        if (this.connectionMode === `SSE`) {
            this.subscription = new HttpSubscriptionSSE(this.endpointConfig, this.handlerConfig);
        } else if (this.connectionMode === `LONGPOLLING`) {
            this.subscription = new HttpSubscriptionPolling(this.endpointConfig, this.handlerConfig);
        }

        if (oldSubscription?.active) {
            this.restarting = true;
            await oldSubscription.stop();
        }
    }

    public setAuthToken(token: string): void {
        this.subscription.authToken = token;
    }

    protected abstract onData(_data: unknown): void;
    protected abstract onError(_error: unknown): void;

    protected handleError(data: unknown): void {
        this.lastError = data;
        this.failedCounter++;
        this.onError(data);
    }

    protected handleContent(data: unknown): void {
        if (this._receivedDataResolver) {
            this._receivedDataResolver();
            this._receivedDataResolver = undefined;
        }

        if (data instanceof ErrorDescription || isCommunicationError(data) || isCommunicationErrorWrapper(data)) {
            this.handleError(data);
        } else {
            data = this.parse(data);
            this.failedCounter = 0;
            this.lastError = null;
            this.onData(data);
        }
    }

    protected parse(data: unknown): any | ErrorDescription {
        return data;
    }

    private resetReceivedData(): void {
        this._receivedData = new Promise(r => {
            this._receivedDataResolver = r;
        });
    }
}
