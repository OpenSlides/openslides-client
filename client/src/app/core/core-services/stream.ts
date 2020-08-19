import { HttpDownloadProgressEvent, HttpEvent, HttpHeaderResponse } from '@angular/common/http';

import { Observable, Subscription } from 'rxjs';

import { Deferred } from '../promises/deferred';

const HEADER_EVENT_TYPE = 2;
const PROGRESS_EVENT_TYPE = 3;
const FINISH_EVENT_TYPE = 4;

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
     * This is the index where we check if there is a \n in the read buffer (event.partialText)
     * This position is always >= contentStartIndex and is > contentStartIndex if the message
     * was too big to fit into one buffer. So we have just a partial message.
     *
     * The difference between this index and contentStartIndex is that this index remembers the position
     * we checked for a \n which lay in the middle of the next JSON-packet.
     */
    private checkedUntilIndex = 0;

    /**
     * This index holds always the position of the current JSON-packet that we are receiving.
     */
    private contentStartIndex = 0;

    private closed = false;

    public constructor(
        observable: Observable<HttpEvent<string>>,
        private messageHandler: (message: T) => void,
        private errorHandler: (error: any) => void
    ) {
        this.subscription = observable.subscribe((event: HttpEvent<string>) => {
            if (this.closed) {
                console.log('got message, but closed');
                return;
            }
            if (event.type === HEADER_EVENT_TYPE) {
                const headerResponse = event as HttpHeaderResponse;
                this._statuscode = headerResponse.status;
                if (headerResponse.status >= 400) {
                    this.hasError = true;
                }
            } else if ((event as HttpEvent<string>).type === PROGRESS_EVENT_TYPE) {
                this.handleMessage(event as HttpDownloadProgressEvent);
            } else if ((event as HttpEvent<string>).type === FINISH_EVENT_TYPE) {
                this.errorHandler('The stream was closed');
            }
        });
    }

    private handleMessage(event: HttpDownloadProgressEvent): void {
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
                    // console.log('received', parsedContent);
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
    }
}
