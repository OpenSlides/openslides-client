import { Injectable } from '@angular/core';

import { HTTPMethod } from '../definitions/http-methods';
import { HttpService } from './http.service';

export interface EndpointConfiguration {
    url: string;
    healthUrl: string;
    method: HTTPMethod;
}

@Injectable({
    providedIn: 'root'
})
export class HttpStreamEndpointService {
    private endpointConfigurations: { [endpoint: string]: EndpointConfiguration } = {};

    public constructor(private http: HttpService) {}

    public registerEndpoint(name: string, url: string, healthUrl: string, method: HTTPMethod = HTTPMethod.GET): void {
        this.endpointConfigurations[name] = { url, healthUrl, method };
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
