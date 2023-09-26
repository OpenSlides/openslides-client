import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { HttpMethod, QueryParams, ResponseType } from 'src/app/infrastructure/definitions/http';

import { HttpService } from '../http.service';
import { EndpointConfiguration } from './endpoint-configuration';
import { HttpStreamEndpointService } from './http-stream-endpoint.service';

class MockHttpService {
    public returnValue: any = undefined;
    public lastRequests: {
        path: string;
        data?: any;
        queryParams?: QueryParams;
        header?: HttpHeaders;
        responseType?: ResponseType;
    }[] = [];
    public async get<T>(
        path: string,
        data?: any,
        queryParams?: QueryParams,
        header?: HttpHeaders,
        responseType?: ResponseType
    ): Promise<T> {
        if (this.returnValue) {
            this.lastRequests.push({ path, data, queryParams, header, responseType });
            return this.returnValue;
        }
        throw new Error(`I am an error thrown by the MockHttpService`);
    }
}

describe(`HttpStreamEndpointService`, () => {
    let service: HttpStreamEndpointService;
    let http: MockHttpService;

    const healthEndpointConfig = new EndpointConfiguration(`url`, `healthUrl`, HttpMethod.PATCH);
    const expectedHealthRequests = [
        {
            path: `healthUrl`,
            data: undefined,
            queryParams: undefined,
            header: undefined,
            responseType: undefined
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [HttpStreamEndpointService, { provide: HttpService, useClass: MockHttpService }]
        });
        service = TestBed.inject(HttpStreamEndpointService);
        http = TestBed.inject(HttpService) as unknown as MockHttpService;
    });

    it(`test registerEndpoint with configuration`, () => {
        const configuration = new EndpointConfiguration(`url1`, `healthUrl1`, HttpMethod.GET);
        service.registerEndpoint(`endpoint1`, configuration);
        expect(service.getEndpoint(`endpoint1`)).toBe(configuration);
    });

    it(`test registerEndpoint with urls and method`, () => {
        service.registerEndpoint(`endpoint2`, `url2`, `healthUrl2`, HttpMethod.POST);
        expect(service.getEndpoint(`endpoint2`)).toEqual({
            url: `url2`,
            healthUrl: `healthUrl2`,
            method: HttpMethod.POST
        });
    });

    it(`test registerEndpoint with healtUrl, method and configuration`, () => {
        service.registerEndpoint(`endpoint4`, `url4`, `healthUrl4`, HttpMethod.DELETE);
        expect(service.getEndpoint(`endpoint4`)).toEqual({
            url: `url4`,
            healthUrl: `healthUrl4`,
            method: HttpMethod.DELETE
        });
    });

    it(`test getEndpoint error response`, () => {
        expect(() => service.getEndpoint(`endpoint`)).toThrowError(`Endpoint endpoint unknown!`);
    });

    for (const date of [
        { title: `success`, returnValue: { healthy: true }, expected: true, expectRequests: expectedHealthRequests },
        { title: `failure`, returnValue: { healthy: false }, expected: false, expectRequests: expectedHealthRequests },
        { title: `error`, returnValue: undefined, expected: false, expectRequests: [] }
    ]) {
        it(`test isEndpointHealthy ${date.title}`, async () => {
            http.returnValue = date.returnValue;
            await expectAsync(service.isEndpointHealthy(healthEndpointConfig)).toBeResolvedTo(date.expected);
            expect(http.lastRequests).toEqual(date.expectRequests);
        });
    }
});
