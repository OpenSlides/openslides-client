import { HttpDownloadProgressEvent, HttpEvent, HttpHeaderResponse } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';

import { Deferred } from '../promises/deferred';
import { SleepPromise } from '../promises/sleep';
import { EndpointConfiguration } from './http-stream-endpoint.service';
import { CommunicationError, ErrorType, isCommunicationError, isCommunicationErrorWrapper } from './stream-utils';

export class ErrorDescription {
    public constructor(
        public readonly type: ErrorType,
        public readonly error: CommunicationError,
        public readonly reason: string
    ) {}
}

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

export interface HttpStreamOptions<T> {
    /**
     * The endpoint a stream connects to
     */
    endpoint?: EndpointConfiguration;
    /**
     * A description to identify a stream
     */
    description?: string;
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
    shouldReconnectOnFailure?: boolean | (() => boolean);
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

    private _statusCode: number;
    private _lastLfIndex = 0;
    private _contentStartIndex = 0;
    private _hasError = false;

    public constructor(
        private readonly onMessage: (content: T) => void,
        private readonly onError: (type: ErrorType, errorContent: string, reason: string) => void,
        private readonly description: string
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
            const LF_INDEX = event.partialText.indexOf(`\n`, this._lastLfIndex);
            if (LF_INDEX > 0) {
                const content = event.partialText.substring(this._contentStartIndex, LF_INDEX);
                this._lastLfIndex = LF_INDEX + 1;
                this._contentStartIndex = LF_INDEX + 1;
                this.handleContent(content, `Error while reading progress event`);
            } else {
                this._lastLfIndex = event.loaded;
            }
        }
    }

    private handleFinishEvent(content: string): void {
        const errorReason = !this.isSingleAction ? `The stream ${this.description} was closed` : undefined;
        this.handleContent(content, errorReason);
    }

    private handleContent(content: string, errorReason: string = `Reported by server`): void {
        const parsedContent = this.parse(content);
        if (parsedContent instanceof ErrorDescription) {
            this.propagateError(content, parsedContent.reason, parsedContent.type);
        } else if (isCommunicationError(parsedContent) || isCommunicationErrorWrapper(parsedContent)) {
            this.propagateError(content, errorReason);
        } else {
            this.propagateMessage(parsedContent);
        }
    }

    private parse(content: string): T | ErrorDescription {
        try {
            return JSON.parse(content) as T;
        } catch (e) {
            return { reason: `JSON is malformed`, type: ErrorType.UNKNOWN, error: e };
        }
    }

    private handleProgressError(event: HttpDownloadProgressEvent): void {
        this.propagateError(event.partialText, `An error occurred`);
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
    public readonly id = Math.floor(Math.random() * (900000 - 1) + 100000); // [100000, 999999]
    public readonly description: string;
    public readonly endpoint: EndpointConfiguration;

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
    private _parser = new StreamMessageParser<T>(
        content => this.handleParsedContent(content),
        (type, errorContent, reason) => this.handleCommunicationError(type, errorContent, reason),
        `${this.id}`
    );

    private _reconnectsBeforeClose: number;
    private _shouldReconnectOnFailure: boolean | (() => boolean);
    private _reconnectTimeout: number | (() => number);

    private _hasErrorReported = false;
    private _reconnectAttempts = 0;
    private _isClosed = false;

    public constructor(
        private createStreamFn: () => Observable<HttpEvent<string>>,
        {
            endpoint,
            description,
            onMessage,
            onError,
            onComplete,
            shouldStartImmediately,
            shouldReconnectOnFailure = true,
            reconnectsBeforeClose = 3,
            reconnectTimeout = 2000
        }: HttpStreamOptions<T> = {}
    ) {
        this.endpoint = endpoint;
        this.description = description;

        this.onMessage = onMessage || emptyFn;
        this.onError = onError || emptyFn;
        this.onComplete = onComplete || emptyFn;

        this._reconnectsBeforeClose = Math.abs(reconnectsBeforeClose);
        this._shouldReconnectOnFailure = shouldReconnectOnFailure;
        this._reconnectTimeout = reconnectTimeout;

        if (shouldStartImmediately) {
            this.open();
        }
    }

    /**
     * This creates a new observable (given by `createStreamFn`) and subscribes to it.
     *
     * Incoming messages and errors are treated by the optional passed `onMessage`- and `onError`-handlers.
     */
    public open(): void {
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
        this._subscription = observable.subscribe(
            event => this.handleStreamEvent(event),
            error => this.handleStreamError(error),
            () => this.onComplete()
        );
    }

    private async instant(): Promise<void> {
        try {
            const event = await this.createStreamFn().toPromise();
            this._parser.isSingleAction = true;
            this._parser.read(event);
        } catch (e) {
            this.handleStreamError(e);
        }
    }

    private handleStreamEvent(event: HttpEvent<string>): void {
        if (this.isClosed) {
            console.warn(`Got incoming message from stream ${this.id}, but it is closed.`);
            return;
        }
        this._parser.read(event);
    }

    private handleStreamError(error: unknown): void {
        const shouldReconnect =
            typeof this._shouldReconnectOnFailure === `function`
                ? this._shouldReconnectOnFailure()
                : this._shouldReconnectOnFailure;
        if (shouldReconnect && !this.hasReachedReconnectLimit) {
            this.handleReconnect();
        } else if (shouldReconnect && this.hasReachedReconnectLimit) {
            // If the stream should reconnect while it reached its reconnection limit propagate the error
            if (error instanceof ErrorDescription) {
                this.propagateError(error);
            } else {
                this.propagateError(
                    ErrorType.SERVER,
                    this.parseCommunicationError(error[0] as string),
                    `Network error`
                );
            }
        }
    }

    private async handleReconnect(): Promise<void> {
        const timeout =
            typeof this._reconnectTimeout === `function` ? this._reconnectTimeout() : this._reconnectTimeout;
        await SleepPromise(Math.abs(timeout));
        ++this._reconnectAttempts;
        this.reconnect();
    }

    private handleParsedContent(data: T): void {
        if (this._reconnectAttempts > 0) {
            console.log(
                `Resetting reconnection attempts (${this.endpoint.url}:${this.id}), because there is a message:`,
                data
            );
            this._reconnectAttempts = 0;
        }
        this.onMessage(data, this);
    }

    private handleCommunicationError(type: ErrorType, errorContent: string, reason: string): void {
        if (!this._hasErrorReported) {
            this._hasErrorReported = true;
            this.handleStreamError(new ErrorDescription(type, this.parseCommunicationError(errorContent), reason));
        }
    }

    private parseCommunicationError(text: string): CommunicationError {
        try {
            const errorBody = JSON.parse(text);
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
    }

    private propagateError(description: ErrorDescription): void;
    private propagateError(type: ErrorType, error: CommunicationError, reason: string): void;
    private propagateError(type: ErrorType | ErrorDescription, error?: CommunicationError, reason?: string): void {
        this.close();
        const description = type instanceof ErrorDescription ? type : new ErrorDescription(type, error, reason);
        this.onError(this, description);
    }
}
