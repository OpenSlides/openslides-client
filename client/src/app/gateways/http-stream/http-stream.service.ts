import { HttpEvent, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HttpOptions } from '../../infrastructure/definitions/http';
import { AuthService } from '../../site/services/auth.service';
import { ConnectionStatusService } from '../../site/services/connection-status.service';
import { HttpService } from '../http.service';
import { HttpStream, HttpStreamOptions } from '.';
import { EndpointConfiguration } from './endpoint-configuration';
import { ShouldReconnectContext } from './http-stream';
import { HttpStreamEndpointService } from './http-stream-endpoint.service';
import { ErrorDescription } from './stream-utils';

const lostConnectionToFn = (endpoint: EndpointConfiguration) => {
    return `Connection lost to ${endpoint.url}`;
};

type HttpParamsGetter = () => HttpParams | { [param: string]: string | string[] } | null;
type HttpBodyGetter = () => any;

type CreateEndpointFn = { endpointIndex: string; customUrlFn: (baseEndpointUrl: string) => string };

interface RequestOptions {
    bodyFn?: HttpBodyGetter;
    paramsFn?: HttpParamsGetter;
}

export enum PossibleStreamError {
    AUTH = `auth`
}

@Injectable({
    providedIn: `root`
})
export class HttpStreamService {
    public constructor(
        private http: HttpService,
        private endpointService: HttpStreamEndpointService,
        private authService: AuthService, // this is an exception
        private connectionStatus: ConnectionStatusService // this is an exception
    ) {}

    public create<T>(
        endpointConfiguration: string | CreateEndpointFn | EndpointConfiguration,
        {
            onError = (_, description) =>
                this.onError(this.getEndpointConfiguration(endpointConfiguration), description),
            shouldReconnectOnFailure = context => this.shouldReconnect(context),
            reconnectTimeout = () => Math.random() * 3000 + 2000,
            ...otherOptions
        }: HttpStreamOptions<T> = {},
        { bodyFn = () => {}, paramsFn = () => null }: RequestOptions = {}
    ): HttpStream<T> {
        const endpoint = this.getEndpointConfiguration(endpointConfiguration);
        const requestOptions = this.getOptions(bodyFn, paramsFn);
        const httpContext = { method: endpoint.method, url: endpoint.url, options: requestOptions };
        const stream = this.http.getObservableFor<HttpEvent<string>>(httpContext);
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

    private shouldReconnect({ error }: ShouldReconnectContext): boolean | Promise<boolean> {
        if (error.error?.type === PossibleStreamError.AUTH || error?.type === PossibleStreamError.AUTH) {
            this.authService.logout();
            return false;
        }

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

    private getEndpointConfiguration(
        endpoint: string | CreateEndpointFn | EndpointConfiguration
    ): EndpointConfiguration {
        if (typeof endpoint === `string`) {
            return this.endpointService.getEndpoint(endpoint);
        } else if (endpoint instanceof EndpointConfiguration) {
            return endpoint;
        } else {
            const configuration = this.endpointService.getEndpoint(endpoint.endpointIndex);
            return { ...configuration, url: endpoint.customUrlFn(configuration.url) };
        }
    }
}
