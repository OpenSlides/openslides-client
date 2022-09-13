import * as fzstd from 'fzstd';

import { AutoupdateSubscription } from './autoupdate-subscription';

export class AutoupdateStream {
    private abortCtrl: AbortController = undefined;
    private activeSubscriptions: AutoupdateSubscription[] = null;
    private active: boolean = false;

    public get subscriptions() {
        return this._subscriptions;
    }

    constructor(
        private _subscriptions: AutoupdateSubscription[],
        private url: string,
        private method: string,
        private authToken: string
    ) {}

    /**
     * Closes the stream
     */
    public abort() {
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
    ): Promise<{ stopReason: 'error' | 'aborted' | 'unused' | 'resolved' | 'in-use' }> {
        if (this.active && !force) {
            return { stopReason: `in-use` };
        }

        try {
            await this.doRequest();
            this.active = false;
        } catch (e) {
            this.active = false;
            if (e.name !== `AbortError`) {
                console.error(e);

                return { stopReason: `error` };
            }

            return { stopReason: this.activeSubscriptions?.length ? `aborted` : `unused` };
        }

        return { stopReason: `resolved` };
    }

    private async doRequest() {
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

        if (this.authToken) {
            headers.authentication = this.authToken;
        }

        this.abortCtrl = new AbortController();

        const response = await fetch(this.url, {
            signal: this.abortCtrl.signal,
            method: this.method,
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
                    for (let subscription of this.subscriptions) {
                        // TODO: It might be possible to only send data to
                        // the subscriptions that actually need it
                        subscription.updateData(data);
                    }
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
    }

    /**
     * Marks a subscription as active
     *
     * @param subscription The subscription that should be marked active
     */
    public notifySubscriptionUsed(subscription: AutoupdateSubscription) {
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
    public notifySubscriptionEmpty(subscription: AutoupdateSubscription) {
        const idx = this.activeSubscriptions.indexOf(subscription);
        if (idx !== -1) {
            this.activeSubscriptions.splice(idx, 1);
        }

        if (!this.activeSubscriptions.length) {
            this.abort();
        }
    }

    private decode(data: Uint8Array) {
        const content = new TextDecoder().decode(data);
        try {
            const atobbed = Uint8Array.from(atob(content), c => c.charCodeAt(0));
            const decompressedArray = fzstd.decompress(atobbed);
            const decompressedString = new TextDecoder().decode(decompressedArray);

            return JSON.parse(decompressedString);
        } catch (e) {
            // Try to parse content without decompression
            try {
                return JSON.parse(content);
            } catch (e) {
                console.error(e);
            }
            console.error(e);

            return null;
        }
    }
}
