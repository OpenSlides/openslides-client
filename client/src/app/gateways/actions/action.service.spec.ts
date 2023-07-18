import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, Observable } from 'rxjs';

import { HttpService } from '../http.service';
import { UserAction } from '../repositories/users/user-action';
import { ActionService } from './action.service';
import { ActionRequest } from './action-utils';

export enum HttpMethodMock {
    POST = `post`
}
export type ResponseType = 'json';
export interface HttpOptions {
    observe?: 'response';
    body?: any;
    headers?:
        | HttpHeaders
        | {
              [header: string]: string | string[];
          };
    responseType?: 'json';
}
export declare abstract class HttpResponseBase {
    readonly headers: HttpHeaders;
    readonly status: number;
    readonly statusText: string;
    readonly url: string | null;
    readonly ok: boolean;
    readonly type: HttpEventType.Response | HttpEventType.ResponseHeader;
}
export declare enum HttpEventType {
    Sent = 0,
    UploadProgress = 1,
    ResponseHeader = 2,
    DownloadProgress = 3,
    Response = 4,
    User = 5
}
export declare type HttpEvent<T> = HttpSentEvent | HttpResponse<T>;

export declare interface HttpSentEvent {
    type: HttpEventType.Sent;
}

export declare class HttpResponse<T> extends HttpResponseBase {
    readonly body: T | null;
    constructor(init?: { body?: T | null; headers?: HttpHeaders; status?: number; statusText?: string; url?: string });
    readonly type: HttpEventType.Response;
    clone(): HttpResponse<T>;
    clone(update: { headers?: HttpHeaders; status?: number; statusText?: string; url?: string }): HttpResponse<T>;
    clone<V>(update: {
        body?: V | null;
        headers?: HttpHeaders;
        status?: number;
        statusText?: string;
        url?: string;
    }): HttpResponse<V>;
}
class HttpServiceMock {
    public async post<T>(path: string, data?: any): Promise<T> {
        return await this.send<T>(path, HttpMethodMock.POST, data);
    }
    private async send<T>(
        path: string,
        method: HttpMethodMock,
        data?: any,
        responseType: ResponseType = `json`
    ): Promise<T> {
        let url = path;
        if (url[0] !== `/`) {
            url = `/` + url;
        }

        const options: HttpOptions = {
            observe: `response`,
            body: data,
            responseType
        };

        try {
            const response = await firstValueFrom(this.getObservableFor<HttpResponse<T>>({ method, url, options }));
            return response.body as T;
        } catch (error) {
            throw new Error(error);
        }
    }
    public getObservableFor<T = any>({
        method,
        url,
        options = {}
    }: {
        method: HttpMethodMock;
        url: string;
        options: HttpOptions;
    }): Observable<T> {
        return this.request<T>(method, url, {
            observe: options.observe ?? (`body` as any),
            responseType: options?.responseType ?? (`json` as any),
            ...options
        }) as any;
    }

    private request<R>(
        method: string,
        url: string,
        options: {
            body?: any;
            observe: 'events';
            responseType?: 'json';
        }
    ): Observable<HttpEvent<R>> {
        return HttpSentEvent.Sen;
    }
}

function func() {
    return true;
}

fdescribe(`Service: ActionService`, () => {
    let httpServiceSpy: jasmine.SpyObj<HttpService>;
    let service: ActionService;
    let actionRequest: [ActionRequest];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpServiceMock],
            providers: [ActionService, { provide: HttpService, useClass: HttpServiceMock }]
        });

        httpServiceSpy = jasmine.createSpyObj(`HttpService`, [`post`]);
        service = new ActionService(httpServiceSpy);
        actionRequest = [{ action: `POST`, data: [1, 2] }];
    });

    it(`method: addBeforeActionFn and removeBeforeActionFn, test if function was savedd and deleted`, () => {
        let id = service.addBeforeActionFn(func);
        expect(service.removeBeforeActionFn(id)).toEqual(undefined);
    });

    it(`method: sendRequests`, async () => {
        let id = service.addBeforeActionFn(func);
        expect(await service.sendRequests<string>(actionRequest)).toBe(null);
        httpServiceSpy.post.and.returnValue(Promise.resolve());
        service.removeBeforeActionFn(id);
        await expectAsync(service.sendRequests(actionRequest)).toBeRejectedWithError(
            `Unknown return type from action service`
        );
        //actionRequest = [{ action: `user.delete`, data: [{ id: 5944 }] }];
        actionRequest = [{ action: UserAction.DELETE, data: [{ id: 5944 }] }];
        await expectAsync(service.sendRequests(actionRequest)).toBeRejectedWithError(
            `This should theoretically work??`
        );
        //expect(await service.sendRequests(actionRequest)).toThrowError(`The action service did not return responses for each request.`);
        //expect(await service.sendRequests(actionRequest, true)).toEqual(null);
    });

    // it(`method: createFromArray`, async () => {
    //     expect(await service.sendRequests<string>(actionRequest)).toBeTruthy();
    //     expect(await service.sendRequests<string>(actionRequest, true)).toBeTruthy();
    // });
});
