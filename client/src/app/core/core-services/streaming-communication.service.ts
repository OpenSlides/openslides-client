import {
    HttpClient,
    HttpDownloadProgressEvent,
    HttpEvent,
    HttpHeaderResponse,
    HttpHeaders,
    HttpParams
} from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, Subscription } from 'rxjs';

import { Deferred } from '../promises/deferred';
import { HTTPMethod } from '../definitions/http-methods';

const HEADER_EVENT_TYPE = 2;
const PROGRESS_EVENT_TYPE = 3;
const FINISH_EVENT_TYPE = 4;

export type Params = HttpParams | { [param: string]: string | string[] };

export class StreamConnectionError extends Error {
    public constructor(public code: number, message: string) {
        super(message);
        this.name = 'StreamConnectionError';
    }
}

export class StreamContainer {
    public readonly id = Math.floor(Math.random() * (900000 - 1) + 100000); // [100000, 999999]

    public hasErroredAmount = 0;

    public stream?: Stream<any>;

    public constructor(
        public method: HTTPMethod,
        public url: string,
        public messageHandler: (message: any) => void,
        public params: () => Params,
        public body: () => any
    ) {}
}

export class Stream<T> {
    private subscription: Subscription = null;

    private hasError = false;

    private _statuscode: number;
    public get statuscode(): number {
        return this._statuscode;
    }

    private _errorContent: any;
    public get errorContent(): any {
        return this._errorContent;
    }

    public readonly gotFirstResponse = new Deferred<boolean>();

    /**
     * This is the index where we checked, if there is a \n in the read buffer (event.partialText)
     * This position is always >= contentStartIndex and is > contentStartIndex, if the message
     * was too big to fit into one buffer. So we have just a partial message.
     *
     * The difference between this index and contentStartIndex is that this index remembers the position
     * we checked for a \n which lay in the middle of the next JOSN-packet.
     */
    private checkedUntilIndex = 0;

    /**
     * This index holds always the position of the current JOSN-packet, that we are receiving.
     */
    private contentStartIndex = 0;

    private closed = false;

    public constructor(
        observable: Observable<HttpEvent<string>>,
        private messageHandler: (message: T) => void,
        private errorHandler: (error: any) => void
    ) {
        console.log('create new Stream');
        this.subscription = observable.subscribe((event: HttpEvent<string>) => {
            if (this.closed) {
                console.log('got message, but closed');
                return;
            }
            console.log('event', event);
            if (event.type === HEADER_EVENT_TYPE) {
                const headerResponse = event as HttpHeaderResponse;
                this._statuscode = headerResponse.status;
                if (headerResponse.status >= 400) {
                    this.hasError = true;
                }
            } else if ((<HttpEvent<string>>event).type === PROGRESS_EVENT_TYPE) {
                this.handleMessage(event as HttpDownloadProgressEvent);
            } else if ((<HttpEvent<string>>event).type === FINISH_EVENT_TYPE) {
                this.errorHandler('The stream was closed');
            }
        });
    }

    private handleMessage(event: HttpDownloadProgressEvent): void {
        console.log('handleMessage', event, event.partialText);
        if (this.hasError) {
            if (!this.gotFirstResponse.wasResolved) {
                this._errorContent = event.partialText;
                this.gotFirstResponse.resolve(this.hasError);
            }
            return;
        }
        // Maybe we get multiple messages, so continue, until the complete buffer is checked.
        while (this.checkedUntilIndex < event.loaded) {
            // check if there is a \n somewhere in [checkedUntilIndex, ...]
            const LF_index = event.partialText.indexOf('\n', this.checkedUntilIndex);

            if (LF_index >= 0) {
                // take string in [contentStartIndex, LF_index-1]. This must be valid JSON.
                // In substring, the last character is exlusive.
                const content = event.partialText.substring(this.contentStartIndex, LF_index);

                // move pointer: next JSON starts at LF_index + 1
                this.checkedUntilIndex = LF_index + 1;
                this.contentStartIndex = LF_index + 1;

                console.log('received', content.length, content);

                let parsedContent;
                try {
                    parsedContent = JSON.parse(content) as T;
                } catch (e) {
                    parsedContent = { error: content };
                }

                if (parsedContent.error) {
                    this.hasError = true;
                    this._errorContent = parsedContent.error;
                    // Do not trigger the error handler, if the connection-retry-routine is still handling this issue
                    if (this.gotFirstResponse.wasResolved) {
                        console.error(parsedContent.error);
                        this.errorHandler(parsedContent.error);
                    } else {
                        this.gotFirstResponse.resolve(this.hasError);
                    }
                    return;
                } else {
                    this.gotFirstResponse.resolve(this.hasError);
                    console.log('publish', parsedContent);
                    this.messageHandler(parsedContent);
                }
            } else {
                this.checkedUntilIndex = event.loaded;
            }
        }
    }

    public close(): void {
        this.subscription.unsubscribe();
        this.subscription = null;
        this.closed = true;
        console.log('stream closed');
    }
}

/**
 * BIG TODO: What happens, if the connection breaks? Maybe we should add a allowReconnect-flag
 * to auto-enable reconnection.
 */
@Injectable({
    providedIn: 'root'
})
export class StreamingCommunicationService {
    public constructor(private http: HttpClient) {}

    public async subscribe<T>(streamContainer: StreamContainer, errorHandler: (error: any) => void): Promise<void> {
        const options: {
            body?: any;
            headers?: HttpHeaders | { [header: string]: string | string[] };
            observe: 'events';
            params?: HttpParams | { [param: string]: string | string[] };
            reportProgress?: boolean;
            responseType: 'text';
            withCredentials?: boolean;
        } = {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'text',
            observe: 'events',
            reportProgress: true
        };
        const params = streamContainer.params();
        if (params) {
            options.params = params;
        }
        const body = streamContainer.body();
        if (body) {
            options.body = body;
        }
        const observable = this.http.request(streamContainer.method, streamContainer.url, options);

        if (streamContainer.stream) {
            console.error('Illegal state!');
        }

        console.log('StreamingCommunicationService.subscribe');
        const stream = new Stream<T>(observable, streamContainer.messageHandler, errorHandler);
        streamContainer.stream = stream;

        const hasError = await stream.gotFirstResponse;
        if (hasError) {
            throw new StreamConnectionError(stream.statuscode, stream.errorContent);
        }
    }
}
