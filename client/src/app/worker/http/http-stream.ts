import {
    ErrorDescription,
    isCommunicationError,
    isCommunicationErrorWrapper
} from '../../gateways/http-stream/stream-utils';
import { AutoupdateSetEndpointParams } from '../autoupdate/interfaces-autoupdate';
import { HttpSubscription, HttpSubscriptionEndpoint } from './http-subscription';
import { HttpSubscriptionPolling } from './http-subscription-polling';
import { HttpSubscriptionSSE } from './http-subscription-sse';

export abstract class HttpStream {
    public failedCounter = 0;

    private static CONNECTION_MODE: 'SSE' | 'LONGPOLLING' = `SSE`;
    private subscription: HttpSubscription;

    private _connecting = false;
    private lastError: any | ErrorDescription = null;
    private restarting = false;

    public get active(): boolean {
        return this.subscription.active;
    }

    public get connecting(): boolean {
        return this._connecting;
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
        const endpointConfig: HttpSubscriptionEndpoint = {
            url: endpoint.url + `?` + queryParams,
            method: endpoint.method,
            authToken,
            payload: requestPayload
        };
        const handlerConfig = {
            onData: (data: unknown) => this.handleContent(data)
        };

        if (HttpStream.CONNECTION_MODE === `SSE`) {
            this.subscription = new HttpSubscriptionSSE(endpointConfig, handlerConfig);
        } else if (HttpStream.CONNECTION_MODE === `LONGPOLLING`) {
            this.subscription = new HttpSubscriptionPolling(endpointConfig, handlerConfig);
        }
    }

    /**
     * Closes the stream
     */
    public async abort(): Promise<void> {
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
            await this.subscription.stop();
        }

        this.restarting = false;
        this.lastError = null;
        try {
            await this.subscription.start();
        } catch (e) {
            if (e.name !== `AbortError`) {
                console.error(e);

                return { stopReason: `error`, error: this.lastError };
            } else if (this.restarting) {
                return await this.start();
            }

            return { stopReason: `aborted`, error: this.lastError };
        }

        if (this.lastError) {
            return { stopReason: `error`, error: this.lastError };
        }

        return { stopReason: `resolved` };
    }

    public restart(): void {
        this.subscription.restart();
    }

    public setAuthToken(token: string): void {
        this.subscription.authToken = token;
    }

    protected abstract onData(_data: unknown): void;
    protected abstract onError(_error: unknown): void;

    /*
    private async doRequest(): Promise<void> {
        const content = next ? this.parse(next) : null;
        const autoupdateSentUnmarkedError = content?.type !== ErrorType.UNKNOWN && content?.error;

        if (!response.ok || autoupdateSentUnmarkedError) {
            if ((headers.authentication ?? null) !== (this.authToken ?? null)) {
                return await this.doRequest();
            }

            let errorContent = null;
            if (content && (errorContent = content)?.error) {
                errorContent = errorContent.error;
            }

            let type = ErrorType.UNKNOWN;
            if ((response.status >= 400 && response.status < 500) || errorContent?.type === `invalid`) {
                type = ErrorType.CLIENT;
            } else if (response.status >= 500) {
                type = ErrorType.SERVER;
            }

            this.lastError = {
                reason: `HTTP error`,
                type,
                error: { code: response.status, content: errorContent, endpoint: this.endpoint }
            };
            if (errorContent?.type !== `auth`) {
                this.onError(this.lastError);
            }
            this.failedCounter++;
        } else if (this.lastError) {
            this.failedCounter++;
        }
    }
        */

    protected handleContent(data: any): void {
        data = this.parse(data);
        if (data instanceof ErrorDescription || isCommunicationError(data) || isCommunicationErrorWrapper(data)) {
            this.lastError = data;
            this.onError(data);
        } else {
            this.failedCounter = 0;
            this.onData(data);
        }
    }

    protected parse(data: string): any | ErrorDescription {
        return data;
    }
}
