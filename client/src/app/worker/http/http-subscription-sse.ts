import { joinTypedArrays, splitTypedArray } from 'src/app/infrastructure/utils';

import { HttpSubscription } from './http-subscription';

export class HttpSubscriptionSSE extends HttpSubscription {
    private abortCtrl: AbortController = undefined;

    public async start(): Promise<void> {
        await this.doRequest();
    }

    public async stop(): Promise<void> {
        if (this.abortCtrl) {
            this.abortCtrl.abort();
        }
    }

    public async restart(): Promise<void> {
        await this.stop();
        await this.start();
    }

    private async doRequest(): Promise<void> {
        this._active = true;

        const headers: any = {
            'Content-Type': `application/json`,
            'ngsw-bypass': true
        };

        if (this.authToken) {
            headers.authentication = this.authToken;
        }

        this.abortCtrl = new AbortController();

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
                if (line[line.length - 1] === LINE_BREAK) {
                    if (next !== null) {
                        line = joinTypedArrays(Uint8Array, next, line);
                    }

                    next = null;
                    this.callbacks.onData(line);
                } else if (next) {
                    next = joinTypedArrays(Uint8Array, next, line);
                } else {
                    next = line;
                }
            }
        }

        if (!response.ok) {
            throw { response, content: next };
        }

        this._active = false;
    }
}
