import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Observable } from 'rxjs';

import {
    formatQueryParams,
    HttpMethod,
    HttpOptions,
    QueryParams,
    ResponseType
} from '../infrastructure/definitions/http';
import { ProcessError } from '../infrastructure/errors';
import { toBase64 } from '../infrastructure/utils/functions';
import { ActionWorkerWatchService } from './action-worker-watch/action-worker-watch.service';
import { ErrorMapService } from './error-mapping/error-map.service';

type HttpHeadersObj = HttpHeaders | { [header: string]: string | string[] };

const defaultHeaders: HttpHeadersObj = { [`Content-Type`]: `application/json` };

interface RequestSettings {
    queryParams?: QueryParams;
    customHeader?: HttpHeaders;
    responseType?: ResponseType;
    catchError?: boolean;
}

@Injectable({
    providedIn: `root`
})
export class HttpService {
    private _actionWorkerWatch: ActionWorkerWatchService;
    private get actionWorkerWatch(): ActionWorkerWatchService {
        if (!this._actionWorkerWatch) {
            this._actionWorkerWatch = this.injector.get(ActionWorkerWatchService);
        }
        return this._actionWorkerWatch;
    }

    public constructor(
        private http: HttpClient,
        private errorMapper: ErrorMapService,
        private injector: Injector,
        private snackBar: MatSnackBar,
        private translate: TranslateService
    ) {}

    /**
     * Send the a http request the the given path.
     * Optionally accepts a request body.
     *
     * @param path the target path, usually starting with /system
     * @param method the required HTTP method (i.e get, post, put)
     * @param data optional, if sending a data body is required
     * @param queryParams optional queryparams to append to the path
     * @param customHeader optional custom HTTP header of required
     * @param responseType optional response type, default set to json (i.e 'arraybuffer')
     * @returns a promise containing a generic
     */
    private async send<T>(
        path: string,
        method: HttpMethod,
        data?: any,
        { queryParams, customHeader, responseType, catchError }: RequestSettings = {}
    ): Promise<T> {
        responseType = responseType ?? `json`;
        catchError = catchError ?? true;
        let url = path + formatQueryParams(queryParams);
        if (url[0] !== `/`) {
            console.warn(`Please prefix the URL "${url}" with a slash.`);
            url = `/` + url;
        }

        const options: HttpOptions = {
            observe: `response`,
            body: data,
            // ngsw-bypass tells the angular service worker to ignore this request.
            // Since any call made from inside the angular code should never be cached anyway, we
            // set it here as the default.
            headers: this.injectBypassHeader(customHeader),
            responseType
        };

        try {
            const response = await firstValueFrom(this.getObservableFor<HttpResponse<T>>({ method, url, options }));
            if (response.status === 202) {
                return (await this.actionWorkerWatch.watch<T>(response, true)).body as T;
            }
            return response.body as T;
        } catch (error) {
            if (error instanceof HttpErrorResponse) {
                if (!!error.error.message) {
                    const cleanError = this.errorMapper.getCleanErrorMessage(error.error.message, {
                        data,
                        url: error.url
                    });
                    if (typeof cleanError !== `string`) {
                        throw cleanError;
                    }
                    this.snackBar.open(cleanError, this.translate.instant(`Ok`));
                    if (!catchError) {
                        throw cleanError;
                    }
                    return null;
                } else if (!navigator.onLine) {
                    const cleanError = this.translate.instant(`The request could not be sent. Check your connection.`);
                    this.snackBar.open(cleanError, this.translate.instant(`Ok`));

                    throw new ProcessError(cleanError);
                }
            }

            throw new ProcessError(error);
        }
    }

    public getObservableFor<T = any>({
        method,
        url,
        options = {}
    }: {
        method: HttpMethod;
        url: string;
        options: HttpOptions;
    }): Observable<T> {
        return this.http.request<T>(method, url, {
            observe: options.observe ?? (`body` as any),
            responseType: options?.responseType ?? (`json` as any),
            headers: this.injectBypassHeader(options?.headers ?? defaultHeaders),
            ...options
        }) as any;
    }

    /**
     * Executes a get on a path with a certain object
     * @param path The path to send the request to.
     * @param data An optional payload for the request.
     * @param queryParams Optional params appended to the path as the query part of the url.
     * @param header optional HTTP header if required
     * @param responseType option expected response type by the request (i.e 'arraybuffer')
     * @returns A promise holding a generic
     */
    public async get<T>(path: string, data?: any, requestSettings?: RequestSettings): Promise<T> {
        return await this.send<T>(path, HttpMethod.GET, data, requestSettings);
    }

    /**
     * Executes a post on a path with a certain object
     * @param path The path to send the request to.
     * @param data An optional payload for the request.
     * @param queryParams Optional params appended to the path as the query part of the url.
     * @param header optional HTTP header if required
     * @returns A promise holding a generic
     */
    public async post<T>(path: string, data?: any, requestSettings?: RequestSettings): Promise<T> {
        return await this.send<T>(path, HttpMethod.POST, data, requestSettings);
    }

    /**
     * Executes a put on a path with a certain object
     * @param path The path to send the request to.
     * @param data An optional payload for the request.
     * @param queryParams Optional params appended to the path as the query part of the url.
     * @param header optional HTTP header if required
     * @returns A promise holding a generic
     */
    public async patch<T>(path: string, data?: any, requestSettings?: RequestSettings): Promise<T> {
        return await this.send<T>(path, HttpMethod.PATCH, data, requestSettings);
    }

    /**
     * Executes a put on a path with a certain object
     * @param path The path to send the request to.
     * @param data An optional payload for the request.
     * @param queryParams Optional params appended to the path as the query part of the url.
     * @param header optional HTTP header if required
     * @returns A promise holding a generic
     */
    public async put<T>(path: string, data?: any, requestSettings?: RequestSettings): Promise<T> {
        return await this.send<T>(path, HttpMethod.PUT, data, requestSettings);
    }

    /**
     * Makes a delete request.
     * @param url The path to send the request to.
     * @param data An optional payload for the request.
     * @param queryParams Optional params appended to the path as the query part of the url.
     * @param header optional HTTP header if required
     * @returns A promise holding a generic
     */
    public async delete<T>(path: string, data?: any, requestSettings?: RequestSettings): Promise<T> {
        return await this.send<T>(path, HttpMethod.DELETE, data, requestSettings);
    }

    /**
     * Retrieves a binary file from the url and returns a base64 value
     *
     * @param url file url
     * @returns a promise with a base64 string
     */
    public async downloadAsBase64(url: string): Promise<{ data: string; type: string }> {
        const headers = new HttpHeaders();
        const file = await this.get<Blob>(url, {}, { customHeader: headers, responseType: `blob` });
        return { data: await toBase64(file), type: file.type };
    }

    /**
     * Injects the bypass header into the given headers.
     *
     * @param headers the headers
     * @returns the modified headers
     */
    private injectBypassHeader(headers: HttpHeadersObj): HttpHeadersObj {
        if (headers instanceof HttpHeaders) {
            return headers.set(`ngsw-bypass`, `true`);
        } else {
            return { 'ngsw-bypass': `true`, ...headers };
        }
    }
}
