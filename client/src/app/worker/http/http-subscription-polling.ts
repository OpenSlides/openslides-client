import { HttpSubscription } from './http-subscription';

const POLLING_INTERVAL = 5000;

export class HttpSubscriptionPolling extends HttpSubscription {
    private timeout = undefined;

    public async start(): Promise<void> {
        await this.initialRequest();
        await this.startPolling();
    }

    public async stop(): Promise<void> {
        clearTimeout(this.timeout);
    }

    public restart(): Promise<void> {
        throw new Error(`Method not implemented.`);
    }

    private async initialRequest(): Promise<void> {
        const headers: any = {
            'ngsw-bypass': true
        };

        if (this.authToken) {
            headers.authentication = this.authToken;
        }

        const url = new URL(this.endpoint.url);
        url.searchParams.set(`longpolling`, `1`);

        const body = new FormData();
        body.append(`request`, this.endpoint.payload);
        body.append(`lastpolling`, null);

        const response = await fetch(url.toString(), {
            method: this.endpoint.method,
            headers,
            body
        });

        const parts = await response.formData();
        // TODO: Handle data
    }

    private async startPolling(): Promise<void> {
        this.timeout = setTimeout(() => {}, POLLING_INTERVAL);
    }
}
