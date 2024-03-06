import { joinTypedArrays, splitTypedArray } from 'src/app/infrastructure/utils';

import { HttpSubscription } from './http-subscription';

export class HttpSubscriptionSSE extends HttpSubscription {
    private abortCtrl: AbortController = undefined;
    private abortResolver: (val?: any) => void | undefined;

    public async start(): Promise<void> {
        await this.doRequest();
    }

    public async stop(): Promise<void> {
        if (this.abortCtrl !== undefined) {
            const abortPromise = new Promise(resolver => (this.abortResolver = resolver));
            setTimeout(this.abortResolver, 5000);
            this.abortCtrl.abort();
            await abortPromise;
            this.abortResolver = undefined;
        }
    }

    private async doRequest(): Promise<void> {
        this._active = true;

        const headers: any = {
            'Content-Type': `application/json`,
            'ngsw-bypass': true
        };

        if (this.endpoint.authToken) {
            headers.authentication = this.endpoint.authToken;
        }

        this.abortCtrl = new AbortController();

        try {
            const response = await fetch(this.endpoint.url, {
                signal: this.abortCtrl.signal,
                method: this.endpoint.method,
                headers,
                body: this.endpoint.payload
            });

            const LINE_BREAK = `\n`.charCodeAt(0);
            const reader = response.body.getReader();
            let next: Uint8Array = null;
            let result: ReadableStreamReadResult<Uint8Array>;
            while (!(result = await reader.read()).done) {
                const lines = splitTypedArray(LINE_BREAK, result.value);
                for (let line of lines) {
                    if (line[line.length - 1] === LINE_BREAK && response.ok) {
                        if (next !== null) {
                            line = joinTypedArrays(Uint8Array, next, line);
                        }

                        next = null;
                        const data = new TextDecoder().decode(line);
                        this.callbacks.onData(data);
                    } else if (next) {
                        next = joinTypedArrays(Uint8Array, next, line);
                    } else {
                        next = line;
                    }
                }
            }

            let data: string | null = null;
            if (next) {
                data = new TextDecoder().decode(next);
            }

            if (!response.ok) {
                const error = this.parseErrorFromResponse(response, await this.parseNonOkResponse(data));
                if (this.callbacks.onError) {
                    this.callbacks.onError(error);
                } else {
                    this.callbacks.onData(error);
                }
                this._active = false;
            } else if (data) {
                this.callbacks.onData(data);
            }
        } catch (e) {
            if (e.name !== `AbortError`) {
                throw e;
            }
        }

        this.abortCtrl = undefined;
        if (this.abortResolver) {
            this.abortResolver();
        }

        this._active = false;
    }

    private async parseNonOkResponse(data: string): Promise<unknown> {
        try {
            return JSON.parse(data);
        } catch (_) {
            return data;
        }
    }
}
