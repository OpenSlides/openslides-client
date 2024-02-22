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
        this.timeout = setTimeout(() => {
            this.nextPoll();
        }, POLLING_INTERVAL);
    }

    private async request() {
        const headers: any = {
            'ngsw-bypass': true
        };

        if (this.endpoint.authToken) {
            headers.authentication = this.endpoint.authToken;
        }

        const url = new URL(this.endpoint.url);
        url.searchParams.set(`longpolling`, `1`);

        const body = new FormData();
        body.append(`request`, this.endpoint.payload);
        if (this.lastHash) {
            body.append(`lastpolling`, this.lastHash);
        }

        const response = await fetch(url.toString(), {
            method: this.endpoint.method,
            headers,
            body
        });

        const parts = await response.formData();
        console.log(parts);
        // TODO: Handle results
    }
}
