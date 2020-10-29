import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpOptions } from '../definitions/http-options';
import { EndpointConfiguration } from './http-stream-endpoint.service';
import { Stream } from './stream';

export type Params = HttpParams | { [param: string]: string | string[] };

export class StreamConnectionError extends Error {
    public constructor(public code: number, message: string) {
        super(message);
        this.name = 'StreamConnectionError';
    }
}

export class StreamContainer {
    public readonly id = Math.floor(Math.random() * (900000 - 1) + 100000); // [100000, 999999]

    public retries = 0;
    public hasErroredAmount = 0;
    public errorHandler: (error: any) => void = null;

    public stream?: Stream<any>;

    public constructor(
        public endpoint: EndpointConfiguration,
        public messageHandler: (message: any) => void,
        public params: () => Params,
        public body: () => any
    ) {}
}

@Injectable({
    providedIn: 'root'
})
export class HttpStreamService {
    public constructor(private http: HttpClient) {}

    /**
     * Creates the stream inside the streamContainer. An StreamConnectionError is thrown, if
     * there is an error during connecting.
     *
     * This method returnes after the first response (First part of the response body) is
     * received. This implies, that it might be long time idle, if an service choose not to send anything.
     */
    public async connect<T>(streamContainer: StreamContainer): Promise<void> {
        if (streamContainer.stream) {
            console.error('Illegal state!');
            return;
        }

        const options = this.getOptions(streamContainer);
        const observable = this.http.request(streamContainer.endpoint.method, streamContainer.endpoint.url, options);
        const stream = new Stream<T>(observable, streamContainer.messageHandler, streamContainer.errorHandler);
        streamContainer.stream = stream;

        const hasError = await stream.gotFirstResponse;
        if (hasError) {
            throw new StreamConnectionError(stream.statuscode, stream.errorContent);
        }
    }

    private getOptions(streamContainer: StreamContainer): HttpOptions {
        const options: HttpOptions = {
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

        return options;
    }
}
