import { HttpHeaders, HttpParams } from '@angular/common/http';

export type ResponseType = `arraybuffer` | `blob` | `json` | `text`;

export enum HttpMethod {
    GET = `get`,
    POST = `post`,
    PUT = `put`,
    PATCH = `patch`,
    DELETE = `delete`
}

export interface HttpOptions {
    body?: any;
    headers?: HttpHeaders | Record<string, string | string[]>;
    params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
    observe?: `body` | `events` | `response`;
    reportProgress?: boolean;
    responseType?: `arraybuffer` | `blob` | `json` | `text`;
    withCredentials?: boolean;
}

type QueryParamValue = string | number | boolean;

/**
 * A key value mapping for params, that should be appended to the url on a new connection.
 */
export type QueryParams = Record<string, QueryParamValue>;

/**
 * Formats query params for the url.
 *
 * @param queryParams
 * @returns the formatted query params as string
 */
export function formatQueryParams(queryParams: QueryParams = {}): string {
    if (!queryParams) {
        // handle null
        return ``;
    }
    let params = ``;
    const keys: string[] = Object.keys(queryParams);
    if (keys.length > 0) {
        params = `?` + keys.map(key => key + `=` + queryParams[key].toString()).join(`&`);
    }
    return params;
}
