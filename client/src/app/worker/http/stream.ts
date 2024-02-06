import {
    ErrorDescription,
    ErrorType,
    isCommunicationError,
    isCommunicationErrorWrapper
} from '../../gateways/http-stream/stream-utils';
import { joinTypedArrays, splitTypedArray } from '../../infrastructure/utils/functions';
import { AutoupdateSetEndpointParams } from '../autoupdate/interfaces-autoupdate';

export class WorkerHttpStream {
    public failedCounter = 0;

    private abortCtrl: AbortController = undefined;
    private _active = false;
    private _connecting = false;
    private _abortResolver: (val?: any) => void | undefined;
    private error: any | ErrorDescription = null;
    private restarting = false;

    public get active(): boolean {
        return this._active;
    }

    public get connecting(): boolean {
        return this._connecting;
    }

    public get failedConnects(): number {
        return this.failedCounter;
    }

    constructor(
        public queryParams: URLSearchParams,
        private endpoint: AutoupdateSetEndpointParams,
        private authToken: string
    ) {}

    /**
     * Closes the stream
     */
    public async abort(): Promise<void> {
        if (this.abortCtrl !== undefined) {
            const abortPromise = new Promise(resolver => (this._abortResolver = resolver));
            setTimeout(this._abortResolver, 5000);
            this.abortCtrl.abort();
            await abortPromise;
            this._abortResolver = undefined;
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
    ): Promise<{ stopReason: 'error' | 'aborted' | 'resolved' | 'in-use'; error?: any }> {
        if (this._active && !force) {
            return { stopReason: `in-use` };
        } else if ((this._active || this.abortCtrl) && force) {
            await this.abort();
        }

        this.restarting = false;
        this.error = null;
        try {
            await this.doRequest();
            this._active = false;

            if (this._abortResolver) {
                this._abortResolver();
            }
        } catch (e) {
            this._active = false;
            if (e.name !== `AbortError`) {
                console.error(e);

                return { stopReason: `error`, error: this.error };
            } else if (this.restarting) {
                return await this.start();
            }

            if (this._abortResolver) {
                this._abortResolver();
            }
            return { stopReason: `aborted`, error: this.error };
        }

        if (this.error) {
            return { stopReason: `error`, error: this.error };
        }

        return { stopReason: `resolved` };
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

    public restart(): void {
        this.restarting = true;
        this.abort();
    }

    public setAuthToken(token: string): void {
        this.authToken = token;
    }

    protected onData(_data: unknown) {}
    protected onError(_error: unknown) {}

    protected requestPayload(): string | undefined {
        return undefined;
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

        const queryParams = this.queryParams.toString() ? `?${this.queryParams.toString()}` : ``;
        const response = await fetch(this.endpoint.url + queryParams, {
            signal: this.abortCtrl.signal,
            method: this.endpoint.method,
            headers,
            body: this.requestPayload()
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
                    this.handleContent(this.parse(line));
                } else if (next) {
                    next = joinTypedArrays(Uint8Array, next, line);
                } else {
                    next = line;
                }
            }
        }

        // Hotfix wrong status codes
        const content = next ? this.parse(next) : null;
        const autoupdateSentUnmarkedError = content?.type !== ErrorType.UNKNOWN && content?.error;

        if (!response.ok || autoupdateSentUnmarkedError) {
            if ((headers.authentication ?? null) !== (this.authToken ?? null)) {
                return await this.doRequest();
            }

            let errorContent = null;
            if (content && (errorContent = content)?.error) {
                errorContent = errorContent.error;
            }

            let type = ErrorType.UNKNOWN;
            if ((response.status >= 400 && response.status < 500) || errorContent?.type === `invalid`) {
                type = ErrorType.CLIENT;
            } else if (response.status >= 500) {
                type = ErrorType.SERVER;
            }

            this.error = {
                reason: `HTTP error`,
                type,
                error: { code: response.status, content: errorContent, endpoint: this.endpoint }
            };
            if (errorContent?.type !== `auth`) {
                this.onError(this.error);
            }
            this.failedCounter++;
        } else if (this.error) {
            this.failedCounter++;
        }
    }

    private handleContent(data: any): void {
        if (data instanceof ErrorDescription || isCommunicationError(data) || isCommunicationErrorWrapper(data)) {
            this.error = data;
            this.onError(data);
        } else {
            this.failedCounter = 0;
            this.onData(data);
        }
    }

    private parse(data: Uint8Array): any | ErrorDescription {
        const content = new TextDecoder().decode(data);
        try {
            return JSON.parse(content);
        } catch (e) {
            return { reason: `JSON is malformed`, type: ErrorType.UNKNOWN, error: e as any };
        }
    }
}
