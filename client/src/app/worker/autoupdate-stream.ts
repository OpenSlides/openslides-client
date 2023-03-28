import * as fzstd from 'fzstd';

import {
    ErrorDescription,
    ErrorType,
    isCommunicationError,
    isCommunicationErrorWrapper
} from '../gateways/http-stream/stream-utils';
import { joinTypedArrays, splitTypedArray } from '../infrastructure/utils/functions';
import { AutoupdateSubscription } from './autoupdate-subscription';
import { AutoupdateSetEndpointParams } from './interfaces-autoupdate';

export class AutoupdateStream {
    public failedCounter: number = 0;

    private abortCtrl: AbortController = undefined;
    private activeSubscriptions: AutoupdateSubscription[] = null;
    private _active: boolean = false;
    private _connecting: boolean = false;
    private _abortResolver: (val?: any) => void | undefined;
    private error: any | ErrorDescription = null;
    private restarting: boolean = false;
    private _currentData: Object | null = null;

    public get active(): boolean {
        return this._active;
    }

    public get connecting(): boolean {
        return this._connecting;
    }

    /**
     * Full data object received by autoupdate
     */
    public get currentData(): Object | null {
        return this._currentData;
    }

    public get subscriptions(): AutoupdateSubscription[] {
        return this._subscriptions;
    }

    public get failedConnects(): number {
        return this.failedCounter;
    }

    constructor(
        private _subscriptions: AutoupdateSubscription[],
        public queryParams: URLSearchParams,
        private endpoint: AutoupdateSetEndpointParams,
        private authToken: string
    ) {}

    /**
     * Clones this stream with the specified subscriptions
     *
     * @param subscriptions The subscriptions handled by the created stream
     */
    public cloneWithSubscriptions(subscriptions: AutoupdateSubscription[]): AutoupdateStream {
        return new AutoupdateStream(subscriptions, this.queryParams, this.endpoint, this.authToken);
    }

    /**
     * Closes the stream
     */
    public async abort(): Promise<void> {
        if (this.abortCtrl !== undefined) {
            const abortPromise = new Promise(resolver => (this._abortResolver = resolver));
            setTimeout(this._abortResolver, 5000);
            // @ts-ignore
            this.abortCtrl.abort();
            await abortPromise;
        }
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
    ): Promise<{ stopReason: 'error' | 'aborted' | 'unused' | 'resolved' | 'in-use'; error?: any }> {
        if (this._active && !force) {
            return { stopReason: `in-use` };
        } else if ((this._active || this.abortCtrl) && force) {
            await this.abort();
        }

        this.restarting = false;
        this.error = null;
        try {
            await this.doRequest();
            this._active = false;

            if (this._abortResolver) {
                this._abortResolver();
            }
        } catch (e) {
            this._active = false;
            if (e.name !== `AbortError`) {
                console.error(e);

                return { stopReason: `error`, error: this.error };
            } else if (this.restarting) {
                return await this.start();
            }

            if (this._abortResolver) {
                this._abortResolver();
            }
            return { stopReason: this.activeSubscriptions?.length ? `aborted` : `unused`, error: this.error };
        }

        if (this.error) {
            return { stopReason: `error`, error: this.error };
        }

        return { stopReason: `resolved` };
    }

    /**
     * Marks a subscription as active
     *
     * @param subscription The subscription that should be marked active
     */
    public notifySubscriptionUsed(subscription: AutoupdateSubscription): void {
        const idx = this.activeSubscriptions.indexOf(subscription);
        if (idx === -1) {
            this.activeSubscriptions.push(subscription);
        }
    }

    /**
     * Marks a subscription as inactive
     *
     * @param subscription The subscription that should be marked inactive
     */
    public notifySubscriptionEmpty(subscription: AutoupdateSubscription): void {
        const idx = this.activeSubscriptions.indexOf(subscription);
        if (idx !== -1) {
            this.activeSubscriptions.splice(idx, 1);
        }

        if (!this.activeSubscriptions.length) {
            this.abort();
        }
    }

    /**
     * Sets the endpoint and restarts the connection with
     * the new configuration
     *
     * @param endpoint configuration of the endpoint
     */
    public updateEndpoint(endpoint: AutoupdateSetEndpointParams): void {
        this.endpoint = endpoint;
        this.restart();
    }

    public restart(): void {
        this.restarting = true;
        this.abort();
        this.clearSubscriptions();
    }

    public clearSubscriptions(): void {
        this._currentData = null;
    }

    public setAuthToken(token: string): void {
        this.authToken = token;
    }

    private async doRequest(): Promise<void> {
        this._active = true;

        if (this.activeSubscriptions === null) {
            this.activeSubscriptions = [];
            for (let subscription of this.subscriptions) {
                this.activeSubscriptions.push(subscription);
                subscription.stream = this;
            }
        }

        const headers: any = {
            'Content-Type': `application/json`,
            'ngsw-bypass': true
        };

        if (this.authToken) {
            headers.authentication = this.authToken;
        }

        this.abortCtrl = new AbortController();

        const queryParams = this.queryParams.toString() ? `?${this.queryParams.toString()}` : ``;
        const response = await fetch(this.endpoint.url + queryParams, {
            signal: this.abortCtrl.signal,
            method: this.endpoint.method,
            headers,
            body: JSON.stringify(this.subscriptions.map(s => s.request))
        });

        const LINE_BREAK = `\n`.charCodeAt(0);
        const reader = response.body.getReader();
        let next: Uint8Array = null;
        let result: ReadableStreamDefaultReadResult<Uint8Array>;
        while (!(result = await reader.read()).done) {
            const lines = splitTypedArray(LINE_BREAK, result.value);
            for (let line of lines) {
                if (line[line.length - 1] === LINE_BREAK) {
                    if (next !== null) {
                        line = joinTypedArrays(Uint8Array, next, line);
                    }

                    next = null;

                    const data = this.queryParams.get(`compress`) ? this.decode(line) : new TextDecoder().decode(line);
                    const parsedData = this.parse(data);
                    this.handleContent(parsedData);
                } else if (next) {
                    next = joinTypedArrays(Uint8Array, next, line);
                } else {
                    next = line;
                }
            }
        }

        if (!response.ok) {
            if (headers.authentication !== this.authToken) {
                return await this.doRequest();
            }

            let errorContent = null;
            if (next && (errorContent = this.parse(this.decode(next)))?.error) {
                errorContent = errorContent.error;
            }

            let type = ErrorType.UNKNOWN;
            if (response.status >= 400 && response.status < 500) {
                type = ErrorType.CLIENT;
            } else if (response.status >= 500) {
                type = ErrorType.SERVER;
            }

            this.error = {
                reason: `HTTP error`,
                type,
                error: { code: response.status, content: errorContent, endpoint: this.endpoint }
            };
            if (errorContent?.type !== `auth`) {
                this.sendErrorToSubscriptions(this.error);
            }
            this.failedCounter++;
        } else if (this.error) {
            this.failedCounter++;
        }
    }

    private handleContent(data: any): void {
        if (data instanceof ErrorDescription || isCommunicationError(data) || isCommunicationErrorWrapper(data)) {
            this.error = data;
            this.sendErrorToSubscriptions(data);
        } else {
            if (this._currentData !== null) {
                Object.assign(this._currentData, data);
            } else {
                this._currentData = data;
            }

            this.failedCounter = 0;
            this.sendToSubscriptions(data);
        }
    }

    private sendToSubscriptions(data: any): void {
        for (let subscription of this.subscriptions) {
            // TODO: It might be possible to only send data to
            // the subscriptions that actually need it
            subscription.updateData(data);
        }
    }

    private sendErrorToSubscriptions(data: any): void {
        for (let subscription of this.subscriptions) {
            subscription.sendError(data);
        }
    }

    private parse(content: string): any | ErrorDescription {
        try {
            return JSON.parse(content);
        } catch (e) {
            return { reason: `JSON is malformed`, type: ErrorType.UNKNOWN, error: e as any };
        }
    }

    private decode(data: Uint8Array): string {
        const content = new TextDecoder().decode(data);
        try {
            const atobbed = Uint8Array.from(atob(content), c => c.charCodeAt(0));
            const decompressedArray = fzstd.decompress(atobbed);
            const decompressedString = new TextDecoder().decode(decompressedArray);

            return decompressedString;
        } catch (e) {
            console.warn(`Received uncompressed message from autoupdate.`);
        }

        return content;
    }
}
