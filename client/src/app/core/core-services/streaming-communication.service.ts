import { HttpClient, HttpDownloadProgressEvent, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, Subject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { HTTPMethod } from './http.service';

const PROGRESS_TYPE = 3;

export class Stream<T> {
    private content = new Subject<T>();

    public get messageObservable(): Observable<T> {
        return this.content.asObservable();
    }

    private subscription: Subscription;

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

    public constructor(observable: Observable<HttpEvent<string>>) {
        return;
        this.subscription = observable
            .pipe(filter(x => x.type === PROGRESS_TYPE))
            .subscribe((event: HttpDownloadProgressEvent) => {
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
                        const parsedContent = JSON.parse(content) as T;
                        console.log(parsedContent);
                        this.content.next(parsedContent);
                    }
                }
            });
    }

    public close(): void {
        this.content.complete();
        this.subscription.unsubscribe();
        this.subscription = null;
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

    public getStream<T>(method: HTTPMethod, url: string, payload: any = null): Stream<T> {
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
        if (payload) {
            options.body = JSON.stringify(payload);
        }
        const observable = this.http.request(method, url, options);

        const connection = new Stream<T>(observable);
        return connection;
    }
}
