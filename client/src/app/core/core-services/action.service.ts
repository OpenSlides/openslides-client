import { Injectable } from '@angular/core';

import { HttpService } from './http.service';

export interface ActionRequest {
    action: string;
    data: any[];
}

interface ActionResponse<T extends {}> {
    success: true;
    message: string;
    results?: ((T | null)[] | null)[];
}
function isActionResponse<T extends {}>(obj: any): obj is ActionResponse<T> {
    const response = obj as ActionResponse<T>;
    return !!obj && response.success === true && !!response.message;
}

interface ActionError {
    success: false;
    message: string;
    error_index?: number;
}

function isActionError(obj: any): obj is ActionError {
    const response = obj as ActionError;
    return !!obj && response.success === false && !!response.message;
}

@Injectable({
    providedIn: 'root'
})
export class ActionService {
    private readonly ACTION_URL = '/system/action/handle_request';

    private constructor(private http: HttpService) {}

    public async sendRequest<T>(action: string, data: any): Promise<T | null> {
        const results = await this.sendRequests<T>([{ action, data: [data] }]);
        if (!results) {
            return null;
        }
        if (results.length !== 1) {
            throw new Error('The action service did not respond with exactly one response for one request.');
        }
        return results[0];
    }

    public async sendBulkRequest<T>(action: string, data: any[]): Promise<T[] | null> {
        const results = await this.sendRequests<T>([{ action, data }]);
        if (results && results.length !== data.length) {
            throw new Error(`Inner resultlength is not ${data.length} from the action service`);
        }
        return results;
    }

    public async sendRequests<T>(requests: ActionRequest[]): Promise<T[] | null> {
        requests = this.trimRequestPayload(requests);
        console.log('send requests:', requests);
        const response = await this.http.post<T>(this.ACTION_URL, requests);
        if (isActionError(response)) {
            throw response.message;
        } else if (isActionResponse<T>(response)) {
            const results = response.results;
            if (!results) {
                return null;
            }
            if (results.length !== requests.length) {
                throw new Error('The action service did not return responses for each request.');
            }
            return results[0];
        }
        throw new Error('Unknown return type from action service');
    }

    /**
     * `Warning`: This makes use of references passed to this function to delete fields.
     *
     * @returns The trimmed request
     */
    private trimRequestPayload(requests: ActionRequest[]): ActionRequest[] {
        for (const request of requests) {
            this.trimArray(request.data);
        }
        return requests;
    }

    /**
     * `Warning`: This makes use of references passed to this function to delete fields.
     *
     * @param array An array of any type. Every entry in the array will be checked to trim.
     */
    private trimArray(array: any[]): void {
        for (const entry of array) {
            this.trimSingleObject(entry);
        }
    }

    /**
     * `Warning`: This makes use of references passed to this function to delete fields.
     *
     * @param date Any value which will be checked. If it's an object, it will iterate over all keys
     * and check `date[key]`. If `date[key]` is a string and its (trimmed) value is empty, then the
     * field will be deleted from `date`.
     */
    private trimSingleObject(date: any): void {
        const temp = { ...date };
        for (const key of Object.keys(temp)) {
            if (temp[key] === undefined || (typeof temp[key] === 'string' && temp[key].trim().length === 0)) {
                delete date[key];
            }
            if (Array.isArray(temp[key])) {
                this.trimArray(date[key]);
            }
            if (typeof temp[key] === 'object' && !!temp[key]) {
                this.trimSingleObject(date[key]);
                if (!Object.keys(date[key]).length) {
                    delete date[key];
                }
            }
        }
    }
}
