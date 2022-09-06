import * as fzstd from 'fzstd';

import { AutoupdateSubscription } from './autoupdate-subscription';

export class AutoupdateStream {
    private abortCtrl: AbortController = undefined;
    private activeSubscriptions: AutoupdateSubscription[] = [];

    constructor(
        private subscriptions: AutoupdateSubscription[],
        private modelRequests: Object[],
        private url: string,
        private method: string,
        private authToken: string
    ) {}

    public abort() {
        // @ts-ignore
        this.abortCtrl.abort();
    }

    public async start() {
        if (this.abortCtrl !== undefined) {
            this.abort();
        }

        for (let subscription of this.subscriptions) {
            subscription.stream = this;
            this.activeSubscriptions.push(subscription);
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
            body: JSON.stringify(this.modelRequests)
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
                        const nTmp = new Uint8Array(i - lastSent + 1 + next.length);
                        nTmp.set(next);
                        nTmp.set(rawData, next.length);

                        rawData = nTmp;
                    }

                    for (let subscription of this.subscriptions) {
                        subscription.updateData(this.decode(rawData));
                    }

                    lastSent = i + 1;
                    next = null;
                } else if (i === val.length - 1) {
                    if (next) {
                        const nTmp = new Uint8Array(i - lastSent + 1 + next.length);
                        nTmp.set(next);
                        nTmp.set(val.slice(lastSent, i), next.length);
                        next = nTmp;
                    } else {
                        next = val.slice(lastSent, i);
                    }
                }
            }
        }
    }

    public notifySubscriptionEmpty(subscription) {
        const idx = this.activeSubscriptions.indexOf(subscription);
        if (idx !== -1) {
            this.activeSubscriptions.splice(idx);
        }

        if (!this.activeSubscriptions.length) {
            this.abort();
        }
    }

    private decode(data: Uint8Array) {
        try {
            const content = new TextDecoder().decode(data);
            const atobbed = Uint8Array.from(atob(content), c => c.charCodeAt(0));
            const decompressedArray = fzstd.decompress(atobbed);
            const decompressedString = new TextDecoder().decode(decompressedArray);

            return JSON.parse(decompressedString);
        } catch (e) {
            console.error(e);
            return null;
        }
    }
}
