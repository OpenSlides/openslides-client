import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
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

const defaultHeaders = { [`Content-Type`]: `application/json` };
@Injectable({
    providedIn: `root`
})
export class HttpService {
    public constructor(private http: HttpClient) {}

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
        method: HttpMethod,
        data?: any,
        queryParams?: QueryParams,
        customHeader?: HttpHeaders,
        responseType: ResponseType = `json`
    ): Promise<T> {
        let url = path + formatQueryParams(queryParams);
        if (url[0] !== `/`) {
            console.warn(`Please prefix the URL "${url}" with a slash.`);
            url = `/` + url;
        }

        const options: HttpOptions = {
            observe: `response`,
            body: data,
            headers: customHeader,
            responseType
        };

        try {
            const response = await firstValueFrom(this.getObservableFor<HttpResponse<T>>(method, url, options));
            return response?.body as T;
        } catch (error) {
            throw new ProcessError(error);
        }
    }

    public getObservableFor<T = any>(method: HttpMethod, url: string, options: HttpOptions = {}): Observable<T> {
        return this.http.request<T>(method, url, {
            observe: options.observe ?? (`body` as any),
            responseType: options?.responseType ?? (`json` as any),
            headers: options?.headers ?? defaultHeaders,
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
    public async get<T>(
        path: string,
        data?: any,
        queryParams?: QueryParams,
        header?: HttpHeaders,
        responseType: ResponseType = `json`
    ): Promise<T> {
        return await this.send<T>(path, HttpMethod.GET, data, queryParams, header, responseType);
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
        return await this.send<T>(path, HttpMethod.POST, data, queryParams, header);
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
        return await this.send<T>(path, HttpMethod.PATCH, data, queryParams, header);
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
        return await this.send<T>(path, HttpMethod.PUT, data, queryParams, header);
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
        return await this.send<T>(path, HttpMethod.DELETE, data, queryParams, header);
    }

    /**
     * Retrieves a binary file from the url and returns a base64 value
     *
     * @param url file url
     * @returns a promise with a base64 string
     */
    public async downloadAsBase64(url: string): Promise<string> {
        const headers = new HttpHeaders();
        const file = await this.get<Blob>(url, {}, {}, headers, `blob`);
        return await toBase64(file);
    }
}
