import { HttpClient, HttpErrorResponse, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { HistoryService } from './history.service';
import { HTTPMethod } from '../definitions/http-methods';
import { HttpOptions } from '../definitions/http-options';
import { formatQueryParams, QueryParams } from '../definitions/query-params';
import { toBase64 } from '../to-base64';

interface ErrorMessageResponse {
    message: string;
    success: boolean;
}

function isErrorMessageResponse(obj: any): obj is ErrorMessageResponse {
    return (
        obj &&
        typeof obj === 'object' &&
        typeof obj.message === 'string' &&
        (obj as ErrorMessageResponse).success === false
    );
}

type ResponseType = 'arraybuffer' | 'blob' | 'json' | 'text';

/**
 * Service for managing HTTP requests. Allows to send data for every method. Also (TODO) will do generic error handling.
 */
@Injectable({
    providedIn: 'root'
})
export class HttpService {
    /**
     * http headers used by most requests
     */
    private defaultHeaders: HttpHeaders;

    /**
     * Construct a HttpService
     *
     * Sets the default headers to application/json
     *
     * @param http The HTTP Client
     * @param translate
     * @param timeTravel requests are only allowed if history mode is disabled
     */
    public constructor(
        private http: HttpClient,
        private translate: TranslateService,
        private historyService: HistoryService
    ) {
        this.defaultHeaders = new HttpHeaders().set('Content-Type', 'application/json');
    }

    /**
     * Send the a http request the the given path.
     * Optionally accepts a request body.
     *
     * @param path the target path, usually starting with /rest
     * @param method the required HTTP method (i.e get, post, put)
     * @param data optional, if sending a data body is required
     * @param queryParams optional queryparams to append to the path
     * @param customHeader optional custom HTTP header of required
     * @param responseType optional response type, default set to json (i.e 'arraybuffer')
     * @returns a promise containing a generic
     */
    private async send<T>(
        path: string,
        method: HTTPMethod,
        data?: any,
        queryParams?: QueryParams,
        customHeader?: HttpHeaders,
        responseType?: ResponseType
    ): Promise<T> {
        // end early, if we are in history mode
        if (this.historyService.isInHistoryMode && method !== HTTPMethod.GET) {
            throw this.processError('You cannot make changes while in history mode');
        }

        // there is a current bug with the responseType.
        // https://github.com/angular/angular/issues/18586
        // castting it to 'json' allows the usage of the current array
        if (!responseType) {
            responseType = 'json';
        }

        let url = path + formatQueryParams(queryParams);
        if (url[0] !== '/') {
            console.warn(`Please prefix the URL "${url}" with a slash.`);
            url = '/' + url;
        }

        const options: HttpOptions = {
            observe: 'response',
            body: data,
            headers: customHeader ? customHeader : this.defaultHeaders,
            responseType: responseType as 'json'
        };

        try {
            const response = await (this.http.request<T>(method, url, options as any) as Observable<
                HttpResponse<T>
            >).toPromise();
            return response.body;
        } catch (error) {
            throw this.processError(error);
        }
    }

    /**
     * Takes an error thrown by the HttpClient. Processes it to return a string that can
     * be presented to the user.
     * @param e The error thrown.
     * @returns The prepared and translated message for the user
     */
    private processError(e: any): string {
        let error = this.translate.instant('Error') + ': ';
        // If the error is a string already, return it.
        if (typeof e === 'string') {
            return error + e;
        }

        // If the error is no HttpErrorResponse, it's not clear what is wrong.
        if (!(e instanceof HttpErrorResponse)) {
            console.error('Unknown error thrown by the http client: ', e);
            error += this.translate.instant('An unknown error occurred.');
            return error;
        }

        if (!e.error) {
            error += this.translate.instant("The server didn't respond.");
        } else if (typeof e.error === 'object') {
            if (isErrorMessageResponse(e.error)) {
                error += e.error.message;
            } else {
                const errorList = Object.keys(e.error).map(key => {
                    const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                    const message = e.error[key];
                    return `${this.translate.instant(capitalizedKey)}: ${message}`;
                });
                error = errorList.join(', ');
            }
        } else if (typeof e.error === 'string') {
            error += e.error;
        } else if (e.status === 500) {
            error += this.translate.instant('A server error occured. Please contact your system administrator.');
        } else if (e.status > 500) {
            error += this.translate.instant('The server could not be reached.') + ` (${e.status})`;
        } else {
            error += e.message;
        }

        return error;
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
    public async get<T>(
        path: string,
        data?: any,
        queryParams?: QueryParams,
        header?: HttpHeaders,
        responseType: ResponseType = 'json'
    ): Promise<T> {
        return await this.send<T>(path, HTTPMethod.GET, data, queryParams, header, responseType);
    }

    /**
     * Executes a post on a path with a certain object
     * @param path The path to send the request to.
     * @param data An optional payload for the request.
     * @param queryParams Optional params appended to the path as the query part of the url.
     * @param header optional HTTP header if required
     * @returns A promise holding a generic
     */
    public async post<T>(path: string, data?: any, queryParams?: QueryParams, header?: HttpHeaders): Promise<T> {
        return await this.send<T>(path, HTTPMethod.POST, data, queryParams, header);
    }

    /**
     * Executes a put on a path with a certain object
     * @param path The path to send the request to.
     * @param data An optional payload for the request.
     * @param queryParams Optional params appended to the path as the query part of the url.
     * @param header optional HTTP header if required
     * @returns A promise holding a generic
     */
    public async patch<T>(path: string, data?: any, queryParams?: QueryParams, header?: HttpHeaders): Promise<T> {
        return await this.send<T>(path, HTTPMethod.PATCH, data, queryParams, header);
    }

    /**
     * Executes a put on a path with a certain object
     * @param path The path to send the request to.
     * @param data An optional payload for the request.
     * @param queryParams Optional params appended to the path as the query part of the url.
     * @param header optional HTTP header if required
     * @returns A promise holding a generic
     */
    public async put<T>(path: string, data?: any, queryParams?: QueryParams, header?: HttpHeaders): Promise<T> {
        return await this.send<T>(path, HTTPMethod.PUT, data, queryParams, header);
    }

    /**
     * Makes a delete request.
     * @param url The path to send the request to.
     * @param data An optional payload for the request.
     * @param queryParams Optional params appended to the path as the query part of the url.
     * @param header optional HTTP header if required
     * @returns A promise holding a generic
     */
    public async delete<T>(path: string, data?: any, queryParams?: QueryParams, header?: HttpHeaders): Promise<T> {
        return await this.send<T>(path, HTTPMethod.DELETE, data, queryParams, header);
    }

    /**
     * Retrieves a binary file from the url and returns a base64 value
     *
     * @param url file url
     * @returns a promise with a base64 string
     */
    public async downloadAsBase64(url: string): Promise<string> {
        const headers = new HttpHeaders();
        const file = await this.get<Blob>(url, {}, {}, headers, 'blob');
        return await toBase64(file);
    }
}
