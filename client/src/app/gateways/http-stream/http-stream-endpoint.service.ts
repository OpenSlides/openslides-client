import { Injectable } from '@angular/core';

import { HttpMethod } from '../../infrastructure/definitions/http';
import { HttpService } from '../http.service';
import { EndpointConfiguration } from './endpoint-configuration';

@Injectable({
    providedIn: `root`
})
export class HttpStreamEndpointService {
    private endpointConfigurations: { [endpoint: string]: EndpointConfiguration } = {};

    public constructor(private http: HttpService) {}

    public registerEndpoint(name: string, configuration: EndpointConfiguration): void;
    public registerEndpoint(name: string, url: string, healthUrl: string, method: HttpMethod): void;
    public registerEndpoint(
        name: string,
        configuration: EndpointConfiguration | string,
        healthUrl?: string,
        method: HttpMethod = HttpMethod.GET
    ): void {
        if (configuration instanceof EndpointConfiguration) {
            this.endpointConfigurations[name] = configuration;
        } else {
            this.endpointConfigurations[name] = { url: configuration, healthUrl: healthUrl!, method };
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
        try {
            const response = await this.http.get<{ healthy: boolean }>(endpoint.healthUrl);
            return !!response.healthy;
        } catch (e) {
            return false;
        }
    }
}
