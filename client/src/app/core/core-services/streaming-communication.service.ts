import { HttpClient, HttpEvent, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, Subject, Subscription } from 'rxjs';

import { HTTPMethod } from './http.service';

// const PROGRESS_TYPE = 3;

export class Stream<T> {
    private content = new Subject<T>();

    public get messageObservable(): Observable<T> {
        return this.content.asObservable();
    }

    private subscription: Subscription;
    /*private lastPosition = 0;

    private nextMessageSize = 0;*/

    public constructor(observable: Observable<HttpEvent<string>>) {
        /*this.subscription = observable.pipe(filter(x => x.type === PROGRESS_TYPE)).subscribe((event: HttpDownloadProgressEvent) => {

            while (this.lastPosition < event.loaded) {
                const newContentLength = event.loaded - this.lastPosition;

                if (this.nextMessageSize === 0) {
                    // We need an anouncement
                    if (newContentLength < 8) {
                        break; // message to short to contain an announcement.
                    }

                    this.nextMessageSize = this.getAnnouncementLength(
                        event.partialText.substring(this.lastPosition, this.lastPosition + 8)
                    );
                    this.lastPosition += 8;
                    console.log("got announcement.", this.lastPosition, this.nextMessageSize)
                } else {
                    if (newContentLength < this.nextMessageSize) {
                        break; // we do not have enough data.
                    }

                    const content = event.partialText.substring(this.lastPosition, this.lastPosition + this.nextMessageSize);
                    this.lastPosition += this.nextMessageSize;
                    this.nextMessageSize = 0;
                    console.log("received", this.lastPosition, this.nextMessageSize)
                    console.log("received", content.length); // , "bytes:", content);

                    const parsedContent = JSON.parse(content) as T;
                    this.content.next(parsedContent);
                }
            }
        });*/
    }

    /*private getAnnouncementLength(str: string): number {
        const buf = new ArrayBuffer(4);
        const bufView = new Uint8Array(buf);
        for (let i = 0; i < 4; i++) {
            const i2 = i * 2;
            bufView[i] = parseInt(str.substring(i2, i2 + 2), 16);
        }
        return new Uint32Array(buf)[0];
    }*/

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
