import * as fzstd from 'fzstd';

import {
    ErrorDescription,
    ErrorType,
    isCommunicationError,
    isCommunicationErrorWrapper
} from '../gateways/http-stream/stream-utils';
import { AutoupdateSubscription } from './autoupdate-subscription';

export class AutoupdateStream {
    public failedCounter: number = 0;

    private abortCtrl: AbortController = undefined;
    private activeSubscriptions: AutoupdateSubscription[] = null;
    private active: boolean = false;
    private error: any | ErrorDescription = null;
    private restart: boolean = false;

    public get subscriptions(): AutoupdateSubscription[] {
        return this._subscriptions;
    }

    public get failedConnects(): number {
        return this.failedCounter;
    }

    constructor(
        private _subscriptions: AutoupdateSubscription[],
        public queryParams: string,
        private endpoint: { url: string; method: string; authToken: string }
    ) {}

    /**
     * Clones this stream with the specified subscriptions
     *
     * @param subscriptions The subscriptions handled by the created stream
     */
    public cloneWithSubscriptions(subscriptions: AutoupdateSubscription[]): AutoupdateStream {
        return new AutoupdateStream(subscriptions, this.queryParams, this.endpoint);
    }

    /**
     * Closes the stream
     */
    public abort(): void {
        if (this.abortCtrl !== undefined) {
            // @ts-ignore
            this.abortCtrl.abort();
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
        if (this.active && !force) {
            return { stopReason: `in-use` };
        } else if (this.active && force) {
            this.abort();
        }

        this.restart = false;
        this.error = null;
        try {
            await this.doRequest();
            this.active = false;
        } catch (e) {
            this.active = false;
            if (e.name !== `AbortError`) {
                console.error(e);

                return { stopReason: `error`, error: this.error };
            } else if (this.restart) {
                return await this.start();
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
    public updateEndpoint(endpoint: any): void {
        this.endpoint = endpoint;
        this.restart = true;
        this.abort();
    }

    private async doRequest(): Promise<void> {
        this.active = true;

        if (this.activeSubscriptions === null) {
            this.activeSubscriptions = [];
            for (let subscription of this.subscriptions) {
                this.activeSubscriptions.push(subscription);
                subscription.stream = this;
            }
        }

        const headers: any = {
            'Content-Type': `application/json`
        };

        if (this.endpoint.authToken) {
            headers.authentication = this.endpoint.authToken;
        }

        this.abortCtrl = new AbortController();

        const response = await fetch(this.endpoint.url + this.queryParams, {
            signal: this.abortCtrl.signal,
            method: this.endpoint.method,
            headers,
            body: JSON.stringify(this.subscriptions.map(s => s.request))
        });

        const reader = response.body.getReader();
        let next = null;
        let result: ReadableStreamDefaultReadResult<Uint8Array>;
        while (!(result = await reader.read()).done) {
            const val = result.value;
            let lastSent = 0;
            for (let i = 0; i < val.length; i++) {
                if (val[i] === 10) {
                    let rawData = val.slice(lastSent, i);
                    if (next !== null) {
                        const nTmp = new Uint8Array(i - lastSent + next.length);
                        nTmp.set(next);
                        nTmp.set(rawData, next.length);

                        rawData = nTmp;
                    }

                    lastSent = i + 1;
                    next = null;

                    const data = this.decode(rawData);
                    const parsedData = this.parse(data);
                    this.handleContent(parsedData);
                } else if (i === val.length - 1) {
                    if (next) {
                        const nTmp = new Uint8Array(i - lastSent + next.length);
                        nTmp.set(next);
                        nTmp.set(val.slice(lastSent, i + 1), next.length);
                        next = nTmp;
                    } else {
                        next = val.slice(lastSent, i + 1);
                    }
                }
            }
        }

        if (!response.ok) {
            let type = ErrorType.UNKNOWN;
            if (response.status >= 400 && response.status < 500) {
                type = ErrorType.CLIENT;
            } else if (response.status >= 500) {
                type = ErrorType.SERVER;
            }

            this.error = { reason: `HTTP error`, type, error: { code: response.status } };
            this.sendErrorToSubscriptions(this.error);
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
