import { HttpSubscription } from './http-subscription';

export const POLLING_INTERVAL = 5000;

export class HttpSubscriptionPolling extends HttpSubscription {
    private lastHash: string = undefined;

    private abortCtrl: AbortController = undefined;
    private abortResolver: (val?: any) => void | undefined;

    private reopen = false;
    private currentTimeoutResolver: CallableFunction;

    public async start(): Promise<void> {
        this._active = true;
        this.reopen = true;
        await this.nextPoll();
        this._active = false;
    }

    public async stop(): Promise<void> {
        this._active = false;
        this.lastHash = undefined;

        if (this.abortCtrl !== undefined) {
            const abortPromise = new Promise(resolver => (this.abortResolver = resolver));
            setTimeout(this.abortResolver, 5000);
            this.abortCtrl.abort();
            await abortPromise;
            this.abortResolver = undefined;
        }

        if (this.currentTimeoutResolver !== undefined) {
            this.currentTimeoutResolver();
        }
    }

    private async nextPoll(): Promise<void> {
        await this.request();
        if (this.active && this.reopen) {
            await new Promise<void>(resolve => {
                const timeout = setTimeout(() => this.currentTimeoutResolver(), POLLING_INTERVAL);

                this.currentTimeoutResolver = () => {
                    this.currentTimeoutResolver = undefined;
                    clearTimeout(timeout);
                    resolve();
                };
            });
        }

        if (this.active && this.reopen) {
            await this.nextPoll();
        }
    }

    private async request() {
        const headers: any = {
            'ngsw-bypass': true
        };

        if (this.endpoint.authToken) {
            headers.authentication = this.endpoint.authToken;
        }

        this.abortCtrl = new AbortController();

        const [url, paramString] = this.endpoint.url.split(`?`);
        const params = new URLSearchParams(paramString);
        params.set(`longpolling`, `1`);

        const body = new FormData();
        body.append(`request`, this.endpoint.payload);
        body.append(`lastpolling`, this.lastHash || null);

        try {
            const response = await fetch(url + `?` + params.toString(), {
                signal: this.abortCtrl.signal,
                method: this.endpoint.method,
                headers,
                body
            });

            try {
                const formData = await response.clone().formData();
                this.lastHash = formData.get(`hash`).toString();
                this.callbacks.onData(formData.get(`data`).toString());
            } catch (_) {}

            if (!response.ok) {
                const data = await this.parseNonOkResponse(response);
                const error = this.parseErrorFromResponse(response, data);
                if (this.callbacks.onError) {
                    this.callbacks.onError(error);
                } else {
                    this.callbacks.onData(error);
                }
                this._active = false;
            }
        } catch (e) {
            if (e.name !== `AbortError`) {
                throw e;
            } else {
                this.reopen = false;
            }
        }

        this.abortCtrl = undefined;

        if (this.abortResolver) {
            this.abortResolver();
        }
    }

    private async parseNonOkResponse(response: Response): Promise<unknown> {
        try {
            return (await response.clone().formData()).get(`data`);
        } catch (_) {
            try {
                return await response.clone().json();
            } catch (_) {
                try {
                    return await response.text();
                } catch (_) {
                    return null;
                }
            }
        }
    }
}
