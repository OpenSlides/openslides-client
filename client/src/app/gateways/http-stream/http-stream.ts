import { HttpDownloadProgressEvent, HttpErrorResponse, HttpEvent, HttpHeaderResponse } from '@angular/common/http';
import * as fzstd from 'fzstd';
import { firstValueFrom, Observable, Subscription } from 'rxjs';

import { EndpointConfiguration } from './endpoint-configuration';
import {
    CommunicationError,
    CommunicationErrorWrapper,
    ErrorDescription,
    ErrorType,
    isCommunicationError,
    isCommunicationErrorWrapper
} from './stream-utils';

type MessageHandler<T> = (data: T, stream: HttpStream<T>) => void;
type ErrorHandler<T> = (stream: HttpStream<T>, description: ErrorDescription) => void;

const emptyFn = () => {};

const HEADER_EVENT_TYPE = 2;
const PROGRESS_EVENT_TYPE = 3;
const FINISH_EVENT_TYPE = 4;

interface StreamData<T> {
    data: T;
    stream: HttpStream<T>;
}

type ReconnectFn = (context: ShouldReconnectContext) => boolean | Promise<boolean>;

export interface ShouldReconnectContext {
    httpStream: HttpStream<any>;
    error: any;
}

export interface HttpStreamOptions<T> {
    /**
     * The endpoint a stream connects to
     */
    endpoint?: EndpointConfiguration;
    /**
     * A string to describe the usage of a stream
     */
    description?: string;
    /**
     * A dedicated id to identify a stream
     */
    id?: number;
    /**
     * Handler to receive incoming data from a server
     *
     * Do not use this when a stream is handled as a promise, because then the `onMessage`-handler will be overwritten.
     */
    onMessage?: MessageHandler<T>;
    /**
     * Function to handle errors reported by this stream
     *
     * Do not use this when a stream is handled as a promise, because then the `onError`-handler will be overwritten.
     */
    onError?: ErrorHandler<T>;
    /**
     * Handler called when a stream is completed
     *
     * Currently, this will not trigger if a stream is handled as a promise.
     */
    onComplete?: () => void;
    /**
     * Whether a stream should start immediately after constructing
     */
    shouldStartImmediately?: boolean;
    /**
     * Whether a stream should be closed and re-opened if an error is thrown
     *
     * This will be done up to the number of reconnects before close (except this number is equal to 0).
     * Also a function can be provided, which returns a boolean.
     */
    shouldReconnectOnFailure?: boolean | Promise<boolean> | ReconnectFn;
    /**
     * An amount of reconnects before a stream will not be opened again
     *
     * Defaults to 3. This will only affect, if `shouldReconnectOnFailure` is set to `true`.
     * The absolute value will be used to avoid the handling of negative numbers.
     */
    reconnectsBeforeClose?: number;
    /**
     * A number in ms a stream will wait before it tries to reconnect
     *
     * This can also be a function, that will return such a number. Defaults to 2000 ms.
     */
    reconnectTimeout?: number | (() => number);
}

class StreamMessageParser<T> {
    /**
     * A flag to know if a stream expects only one message. If not and a stream receives a `FINISH`-event,
     * then the stream is closed caused by an error.
     */
    public isSingleAction = false;

    private _statusCode = 200;
    private _lastLfIndex = 0;
    private _contentStartIndex = 0;
    private _hasError = false;

    public constructor(
        private readonly onMessage: (content: T) => void,
        private readonly onError: (type: ErrorType, errorContent: string, reason: string) => void,
        private readonly description: string,
        private url?: string
    ) {}

    public read(event: HttpEvent<string>): void {
        if (event.type === HEADER_EVENT_TYPE) {
            this._statusCode = (event as HttpHeaderResponse).status;
            if (this._statusCode > 400) {
                this._hasError = true;
            }
        } else if (event.type === PROGRESS_EVENT_TYPE) {
            if (this._hasError) {
                this.handleProgressError(event as HttpDownloadProgressEvent);
            } else {
                this.handleProgressEvent(event as HttpDownloadProgressEvent);
            }
        } else if (event.type === FINISH_EVENT_TYPE) {
            this.handleFinishEvent(event.body);
        }
    }

    private handleProgressEvent(event: HttpDownloadProgressEvent): void {
        while (this._lastLfIndex < event.loaded) {
            const LF_INDEX = event.partialText!.indexOf(`\n`, this._lastLfIndex);
            if (LF_INDEX > 0) {
                const content = event.partialText!.substring(this._contentStartIndex, LF_INDEX);
                this._lastLfIndex = LF_INDEX + 1;
                this._contentStartIndex = LF_INDEX + 1;
                this.handleContent(content, `Error while reading progress event`);
            } else {
                this._lastLfIndex = event.loaded;
            }
        }
    }

    private handleFinishEvent(content: string | null): void {
        const errorReason = !this.isSingleAction ? `The stream ${this.description} was closed` : undefined;
        if (content) {
            this.handleContent(content, errorReason);
        }
    }

    private handleContent(content: string, errorReason: string = `Reported by server`): void {
        const decompressedContent = this.decompressContent(content);
        const parsedContent = this.parse(decompressedContent);
        if (parsedContent instanceof ErrorDescription) {
            this.propagateError(content, parsedContent.reason, parsedContent.type);
        } else if (isCommunicationError(parsedContent) || isCommunicationErrorWrapper(parsedContent)) {
            this.propagateError(content, errorReason);
        } else {
            this.propagateMessage(parsedContent);
        }
    }

    private decompressContent(content: string): string {
        // only try to decode if the message came from the autoupdate service
        if (!!this.url && this.url.split(`/`)[1] === `system` && /autoupdate/.test(this.url.split(`/`)[2])) {
            try {
                const atobbed = Uint8Array.from(atob(content), c => c.charCodeAt(0));
                const decompressedArray = fzstd.decompress(atobbed);
                const decompressedString = new TextDecoder().decode(decompressedArray);
                return decompressedString;
            } catch (e) {
                // If it fails, assume that the content wasn't encoded in the first place, but throw a warning for safety.
                console.warn(`Received uncompressed message from autoupdate.`);
            }
        }
        return content;
    }

    private parse(content: string): T | ErrorDescription {
        try {
            return JSON.parse(content) as T;
        } catch (e) {
            return { reason: `JSON is malformed`, type: ErrorType.UNKNOWN, error: e as any };
        }
    }

    private handleProgressError(event: HttpDownloadProgressEvent): void {
        this.propagateError(event.partialText!, `An error occurred`);
    }

    private getErrorTypeFromStatusCode(): ErrorType {
        if (this._statusCode >= 400 && this._statusCode < 500) {
            return ErrorType.CLIENT;
        }
        if (this._statusCode >= 500) {
            return ErrorType.SERVER;
        }
        return ErrorType.UNKNOWN;
    }

    private propagateMessage(parsedContent: T): void {
        this.onMessage(parsedContent);
    }

    private propagateError(text: string, reason: string, type: ErrorType = this.getErrorTypeFromStatusCode()): void {
        this.onError(type, text, reason);
    }
}

export class HttpStream<T> {
    public readonly id: number;
    public readonly description: string | undefined;
    public readonly endpoint: EndpointConfiguration | undefined;

    public onMessage: MessageHandler<T>;
    public onError: ErrorHandler<T>;
    public onComplete: () => void;

    public get isClosed(): boolean {
        return this._isClosed;
    }

    private get hasReachedReconnectLimit(): boolean {
        return this._reconnectsBeforeClose > 0 && this._reconnectAttempts >= this._reconnectsBeforeClose;
    }

    private _subscription: Subscription | null = null;
    private _parser!: StreamMessageParser<T>;

    private _reconnectsBeforeClose: number;
    private _shouldReconnectOnFailure: boolean | Promise<boolean> | ReconnectFn;
    private _reconnectTimeout: number | (() => number);

    private _hasErrorReported = false;
    private _reconnectAttempts = 0;
    private _isClosed = false;

    public constructor(private createStreamFn: () => Observable<HttpEvent<string>>, config: HttpStreamOptions<T> = {}) {
        this.id = config.id ?? Math.floor(Math.random() * (900000 - 1) + 100000); // [100000, 999999]
        this.endpoint = config.endpoint;
        this.description = config.description;

        this.onMessage = config.onMessage || emptyFn;
        this.onError = config.onError || emptyFn;
        this.onComplete = config.onComplete || emptyFn;

        this._reconnectsBeforeClose = Math.abs(config.reconnectsBeforeClose || 3);
        this._shouldReconnectOnFailure = config.shouldReconnectOnFailure ?? false;
        this._reconnectTimeout = config.reconnectTimeout ?? 2000;

        this.buildMessageParser();

        if (config.shouldStartImmediately) {
            this.open();
        }
    }

    /**
     * This creates a new observable (given by `createStreamFn`) and subscribes to it.
     *
     * Incoming messages and errors are treated by the optional passed `onMessage`- and `onError`-handlers.
     */
    public open(): void {
        // TODO: remove if https://github.com/cypress-io/cypress/issues/3708 fixed
        if ((<any>window).isCypressTest) {
            return;
        }

        this._isClosed = false;
        this.subscribe();
    }

    /**
     * This creates a new observable (given by `createStreamFn`) and resolves it as a promise.
     *
     * @returns the first incoming message from the created observable.
     */
    public async toPromise(): Promise<StreamData<T>> {
        return new Promise(async (resolve, reject) => {
            this.onMessage = (data, stream) => resolve({ data, stream });
            this.onError = (stream, description) => reject({ stream, description });
            await this.instant();
        });
    }

    public close(): void {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = null;
            this._isClosed = true;
        }
    }

    public reconnect(): void {
        this.close();
        this.open();
    }

    private subscribe(): void {
        const observable = this.createStreamFn();
        this._subscription = observable.subscribe({
            next: event => this.handleStreamEvent(event),
            error: error => this.handleStreamError(error),
            complete: () => this.onComplete()
        });
    }

    private async instant(): Promise<void> {
        try {
            const event = await firstValueFrom(this.createStreamFn());
            this._parser.isSingleAction = true;
            this._parser.read(event);
        } catch (e) {
            this.handleError(e);
        }
    }

    private handleStreamEvent(event: HttpEvent<string>): void {
        if (this.isClosed) {
            console.warn(`Got incoming message from stream ${this.id}, but it is closed.`);
            return;
        }
        this._parser.read(event);
    }

    private async handleStreamError(error: unknown): Promise<void> {
        if (error instanceof HttpErrorResponse) {
            error = error.error;
            try {
                error = this.parseCommunicationError(error as any);
            } catch (e) {}
        }
        this.handleError(error);
    }

    private async handleError(error: unknown): Promise<void> {
        console.log(`Handle stream error:`, error);
        console.log(
            `${this.id}:${this.description}: Retry counter ${this._reconnectAttempts} of ${this._reconnectsBeforeClose}`
        );
        const shouldReconnect = await this.shouldReconnect(error);
        if (shouldReconnect && !this.hasReachedReconnectLimit) {
            this.handleReconnect();
        } else if (shouldReconnect && this.hasReachedReconnectLimit) {
            // If the stream should reconnect while it reached its reconnection limit propagate the error
            if (error instanceof ErrorDescription) {
                this.propagateError(error);
            } else {
                this.propagateError(
                    ErrorType.SERVER,
                    this.parseCommunicationError((error as any)[0] as string),
                    `Network error`
                );
            }
        }
    }

    private async shouldReconnect(error: unknown): Promise<boolean> {
        if (typeof this._shouldReconnectOnFailure === `function`) {
            return await this._shouldReconnectOnFailure({ httpStream: this, error });
        } else {
            return await this._shouldReconnectOnFailure;
        }
    }

    private handleReconnect(): void {
        const timeout =
            typeof this._reconnectTimeout === `function` ? this._reconnectTimeout() : this._reconnectTimeout;
        setTimeout(() => {
            ++this._reconnectAttempts;
            this.reconnect();
        }, Math.abs(timeout));
    }

    private buildMessageParser(): void {
        this._parser = new StreamMessageParser<T>(
            content => this.handleParsedContent(content),
            (type, errorContent, reason) => this.handleCommunicationError(type, errorContent, reason),
            `${this.id}`,
            this.endpoint.url
        );
    }

    private handleParsedContent(data: T): void {
        if (this._reconnectAttempts > 0) {
            console.log(
                `Resetting reconnection attempts (${this.endpoint?.url}:${this.id}), because there is a message:`,
                data
            );
            this._reconnectAttempts = 0;
        }
        this.onMessage(data, this);
    }

    private handleCommunicationError(type: ErrorType, errorContent: string, reason: string): void {
        if (!this._hasErrorReported) {
            this._hasErrorReported = true;
            this.handleError(new ErrorDescription(type, this.parseCommunicationError(errorContent), reason));
        }
    }

    private parseCommunicationError(text: string): CommunicationError {
        try {
            const errorBody = JSON.parse(text) as CommunicationError | CommunicationErrorWrapper;
            if (isCommunicationError(errorBody)) {
                return errorBody;
            }
            if (isCommunicationErrorWrapper(errorBody)) {
                return errorBody.error;
            }
        } catch (e) {
            return {
                type: `Invalid message`,
                msg: text
            };
        }
        return { msg: ``, type: `` };
    }

    private propagateError(description: ErrorDescription): void;
    private propagateError(type: ErrorType, error: CommunicationError, reason: string): void;
    private propagateError(type: ErrorType | ErrorDescription, error?: CommunicationError, reason?: string): void {
        this.close();
        const description = type instanceof ErrorDescription ? type : new ErrorDescription(type, error!, reason!);
        this.onError(this, description);
    }
}
