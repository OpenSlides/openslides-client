import { Injectable } from '@angular/core';
import { HttpEvent, HttpParams } from '@angular/common/http';
import { HttpStreamEndpointService } from './http-stream-endpoint.service';
import { EndpointConfiguration } from './endpoint-configuration';
import { HttpStream, HttpStreamOptions } from '.';
import { HttpOptions } from '../../infrastructure/definitions/http';
import { HttpService } from '../http.service';
import { AuthService } from '../../site/services/auth.service';
import { ErrorDescription } from './stream-utils';
import { ConnectionStatusService } from '../../site/services/connection-status.service';

const lostConnectionToFn = (endpoint: EndpointConfiguration) => {
    return `Connection lost to ${endpoint.url}`;
};

type HttpParamsGetter = () => HttpParams | { [param: string]: string | string[] } | null;
type HttpBodyGetter = () => any;
interface RequestOptions {
    bodyFn?: HttpBodyGetter;
    paramsFn?: HttpParamsGetter;
}

@Injectable({
    providedIn: 'root'
})
export class HttpStreamService {
    public constructor(
        private http: HttpService,
        private endpointService: HttpStreamEndpointService,
        private authService: AuthService, // this is an exception
        private connectionStatus: ConnectionStatusService // this is an exception
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
        const stream = this.http.getObservableFor<HttpEvent<string>>(endpoint.method, endpoint.url, requestOptions);
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
        this.connectionStatus.goOffline({
            reason: lostConnectionToFn(endpoint),
            isOnlineFn: async () => this.endpointService.isEndpointHealthy(endpoint)
        });
    }

    private shouldReconnect(): boolean {
        // do not continue, if we are offline!
        if (this.connectionStatus.isOffline()) {
            console.log(`we are offline?`);
            return false;
        }

        // do not continue, if the operator changed!
        if (!this.authService.isAuthenticated()) {
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
