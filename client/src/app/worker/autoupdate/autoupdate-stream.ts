import * as fzstd from 'fzstd';

import { HttpStream } from '../http/http-stream';
import { ErrorDescription, ErrorType } from '../http/stream-utils';
import { AutoupdateSubscription } from './autoupdate-subscription';
import { AutoupdateSetEndpointParams } from './interfaces-autoupdate';

export class AutoupdateStream extends HttpStream {
    private activeSubscriptions: AutoupdateSubscription[] = null;
    private _currentData: unknown | null = null;

    /**
     * Full data object received by autoupdate
     */
    public get currentData(): unknown | null {
        return this._currentData;
    }

    public get subscriptions(): AutoupdateSubscription[] {
        return this._subscriptions;
    }

    constructor(
        private _subscriptions: AutoupdateSubscription[],
        public queryParams: URLSearchParams,
        private endpoint: AutoupdateSetEndpointParams,
        private authToken: string
    ) {
        super(queryParams, endpoint, authToken, JSON.stringify(_subscriptions.map(s => s.request)));
    }

    /**
     * Clones this stream with the specified subscriptions
     *
     * @param subscriptions The subscriptions handled by the created stream
     */
    public cloneWithSubscriptions(
        subscriptions: AutoupdateSubscription[],
        queryParams = this.queryParams
    ): AutoupdateStream {
        return new AutoupdateStream(subscriptions, queryParams, this.endpoint, this.authToken);
    }

    public override async start(
        force?: boolean
    ): Promise<{ stopReason: 'error' | 'aborted' | 'resolved' | 'in-use' | string; error?: any }> {
        if (this.activeSubscriptions === null) {
            this.activeSubscriptions = [];
            for (const subscription of this.subscriptions) {
                this.activeSubscriptions.push(subscription);
                subscription.stream = this;
            }
        }

        if (!this.activeSubscriptions?.length) {
            return { stopReason: `unused` };
        }

        const stopInfo = await super.start(force);
        if (stopInfo.stopReason === `aborted` && !this.activeSubscriptions?.length) {
            stopInfo.stopReason = `unused`;
        }

        return stopInfo;
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

    public override async restart(): Promise<void> {
        super.restart();
        this.clearSubscriptions();
    }

    /**
     * Removes fqids from the cache.
     *;
     * @param fqids list of fqids to delete
     */
    public removeFqids(fqids: string[]): void {
        let lastHit: string | null = null;
        for (const key of Object.keys(this._currentData)) {
            if (lastHit === null || !key.startsWith(fqids[lastHit] + `/`)) {
                lastHit = null;
                for (let i = 0; i < fqids.length; i++) {
                    if (key.startsWith(fqids[i] + `/`)) {
                        lastHit = key;
                        break;
                    }
                }
            }

            if (lastHit !== null) {
                delete this._currentData[key];
            }
        }
    }

    public clearSubscriptions(): void {
        this._currentData = null;
    }

    protected onData(data: unknown): void {
        if (this._currentData !== null) {
            Object.assign(this._currentData, data);
        } else {
            this._currentData = data;
        }

        this.sendToSubscriptions(data);
    }

    protected onError(error: unknown): void {
        this.sendErrorToSubscriptions(error);
    }

    protected override parse(content: unknown): any | ErrorDescription {
        if (this.queryParams.get(`compress`)) {
            content = this.decode(content as string);
        }

        try {
            return JSON.parse(content as string);
        } catch (e) {
            return { reason: `JSON is malformed`, type: ErrorType.UNKNOWN, error: e as any };
        }
    }

    private decode(data: string): string {
        try {
            const atobbed = Uint8Array.from(atob(data), c => c.charCodeAt(0));
            const decompressedArray = fzstd.decompress(atobbed);
            const decompressedString = new TextDecoder().decode(decompressedArray);

            return decompressedString;
        } catch (e) {
            console.warn(`Received uncompressed message from autoupdate.`);
        }

        return data;
    }

    private sendToSubscriptions(data: any): void {
        for (const subscription of this.subscriptions) {
            // TODO: It might be possible to only send data to
            // the subscriptions that actually need it
            subscription.updateData(data);
        }
    }

    private sendErrorToSubscriptions(data: any): void {
        for (const subscription of this.subscriptions) {
            subscription.sendError(data);
        }
    }
}
