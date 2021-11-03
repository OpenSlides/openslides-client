import { Injectable } from '@angular/core';

import { HTTPMethod } from '../definitions/http-methods';
import { HttpService } from './http.service';

export class EndpointConfiguration {
    public constructor(public url: string, public healthUrl: string, public method: HTTPMethod) {}
}

@Injectable({
    providedIn: `root`
})
export class HttpStreamEndpointService {
    private endpointConfigurations: { [endpoint: string]: EndpointConfiguration } = {};

    public constructor(private http: HttpService) {}

    public registerEndpoint(name: string, configuration: EndpointConfiguration): void;
    public registerEndpoint(name: string, url: string, healthUrl: string, method: HTTPMethod): void;
    public registerEndpoint(
        name: string,
        configuration: EndpointConfiguration | string,
        healthUrl?: string,
        method: HTTPMethod = HTTPMethod.GET
    ): void {
        if (configuration instanceof EndpointConfiguration) {
            this.endpointConfigurations[name] = configuration;
        } else {
            this.endpointConfigurations[name] = { url: configuration, healthUrl, method };
        }
    }

    public getEndpoint(name: string): EndpointConfiguration {
        const endpoint = this.endpointConfigurations[name];

        if (!endpoint) {
            throw new Error(`Endpoint ${name} unknown!`);
        }

        return endpoint;
    }

    public async isEndpointHealthy(endpoint: EndpointConfiguration): Promise<boolean> {
        // TODO: Add ngsw-bypass header
        try {
            const response = await this.http.get<{ healthy: boolean }>(endpoint.healthUrl);
            return !!response.healthy;
        } catch (e) {
            return false;
        }
    }
}
