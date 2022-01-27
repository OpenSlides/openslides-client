import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpOptions } from '../definitions/http-options';
import { AuthService } from './auth.service';
import { HttpBodyGetter, HttpParamsGetter } from './communication-manager.service';
import { ErrorDescription, HttpStream, HttpStreamOptions } from './http-stream';
import { EndpointConfiguration, HttpStreamEndpointService } from './http-stream-endpoint.service';
import { OfflineService } from './offline.service';

export type Params = HttpParams | { [param: string]: string | string[] };

export interface RequestOptions {
    bodyFn?: HttpBodyGetter;
    paramsFn?: HttpParamsGetter;
}

const lostConnectionToFn = (endpoint: EndpointConfiguration) => {
    return `Connection lost to ${endpoint.url}`;
};

@Injectable({
    providedIn: `root`
})
export class HttpStreamService {
    public constructor(
        private http: HttpClient,
        private endpointService: HttpStreamEndpointService,
        private auth: AuthService,
        private offlineService: OfflineService
    ) {}

    public create<T>(
        endpointConfiguration: string | EndpointConfiguration,
        {
            onError = (_, description) =>
                this.onError(this.getEndpointConfiguration(endpointConfiguration), description),
            shouldReconnectOnFailure = () => this.shouldReconnect(),
            reconnectTimeout = () => Math.random() * 3000 + 2000,
            ...otherOptions
        }: HttpStreamOptions<T> = {},
        { bodyFn = () => {}, paramsFn = () => null }: RequestOptions = {}
    ): HttpStream<T> {
        const endpoint = this.getEndpointConfiguration(endpointConfiguration);
        const requestOptions = this.getOptions(bodyFn, paramsFn);
        const stream = this.http.request(endpoint.method, endpoint.url, requestOptions);
        return new HttpStream(() => stream, {
            endpoint,
            onError,
            shouldReconnectOnFailure,
            reconnectTimeout,
            ...otherOptions
        });
    }

    private getOptions(bodyFn: HttpBodyGetter, paramsFn: HttpParamsGetter): HttpOptions {
        const options: HttpOptions = {
            headers: { 'Content-Type': `application/json` },
            responseType: `text`,
            observe: `events`,
            reportProgress: true
        };

        const params = paramsFn();
        if (params) {
            options.params = params;
        }

        const body = bodyFn();
        if (body) {
            options.body = body;
        }

        return options;
    }

    private onError(endpoint: EndpointConfiguration, description?: ErrorDescription): void {
        console.log(`ERROR`, description);
        this.offlineService.goOffline({
            reason: lostConnectionToFn(endpoint),
            isOnlineFn: async () => this.endpointService.isEndpointHealthy(endpoint)
        });
    }

    private shouldReconnect(): boolean {
        // do not continue, if we are offline!
        if (this.offlineService.isOffline()) {
            console.log(`we are offline?`);
            return false;
        }

        // do not continue, if the operator changed!
        if (!this.auth.isAuthenticated()) {
            console.log(`operator changed, do not retry`);
            return false;
        }

        return true;
    }

    private getEndpointConfiguration(endpoint: string | EndpointConfiguration): EndpointConfiguration {
        if (typeof endpoint === `string`) {
            return this.endpointService.getEndpoint(endpoint);
        } else {
            return endpoint;
        }
    }
}
