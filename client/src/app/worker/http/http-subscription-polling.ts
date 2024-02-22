import { HttpSubscription } from './http-subscription';

const POLLING_INTERVAL = 5000;

export class HttpSubscriptionPolling extends HttpSubscription {
    private timeout = undefined;
    private lastHash: string = undefined;

    public async start(): Promise<void> {
        await this.nextPoll();
    }

    public async stop(): Promise<void> {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.lastHash = undefined;
    }

    public async restart(): Promise<void> {
        await this.stop();
        await this.start();
    }

    private async nextPoll(): Promise<void> {
        await this.request();
        await new Promise<void>(resolve => {
            this.timeout = setTimeout(() => resolve(), POLLING_INTERVAL);
        });
        await this.nextPoll();
    }

    private async request() {
        const headers: any = {
            'ngsw-bypass': true
        };

        if (this.endpoint.authToken) {
            headers.authentication = this.endpoint.authToken;
        }

        const [url, paramString] = this.endpoint.url.split(`?`);
        const params = new URLSearchParams(paramString);
        params.set(`longpolling`, `1`);

        const body = new FormData();
        body.append(`request`, this.endpoint.payload);
        body.append(`lastpolling`, this.lastHash || null);

        const response = await fetch(url + `?` + params.toString(), {
            method: this.endpoint.method,
            headers,
            body
        });

        // const parts = btoa(await response.text());
        try {
            const formData = await response.formData();
            this.lastHash = formData.get(`hash`).toString();
            this.callbacks.onData(formData.get(`data`).toString());
        } catch (e) {
            console.error(e);
        }
        // TODO: Handle results
    }
}
