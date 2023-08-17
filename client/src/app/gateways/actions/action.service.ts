import { Injectable } from '@angular/core';

import { HttpService } from '../http.service';
import { Action } from './action';
import { ActionRequest, isActionError, isActionResponse } from './action-utils';

type ActionFn = () => boolean;
const ACTION_URL = `/system/action/handle_request`;
const ACTION_SEPARATELY_URL = `/system/action/handle_separately`;

let uniqueFnId = 0;

@Injectable({
    providedIn: `root`
})
export class ActionService {
    private readonly _beforeActionFnMap: { [index: number]: ActionFn } = {};

    public constructor(private http: HttpService) {}

    /**
     * Registers a boolean function that will be used to check if actions should currently be allowed to be sent.
     * If any of the registered functions returns true, no actions will be sent.
     *
     * @returns the index under which the function is registered. Can be used to remove it later.
     */
    public addBeforeActionFn(fn: () => boolean): number {
        this._beforeActionFnMap[++uniqueFnId] = fn;
        return uniqueFnId;
    }

    public removeBeforeActionFn(index: number): void {
        delete this._beforeActionFnMap[index];
    }

    public async sendRequests<T>(requests: ActionRequest[], handle_separately = false): Promise<T[] | null> {
        if (!this.isAllowed()) {
            return null;
        }
        console.log(`send requests:`, requests);
        const response = await this.http.post<T>(handle_separately ? ACTION_SEPARATELY_URL : ACTION_URL, requests);
        if (isActionError(response)) {
            throw response.message;
        } else if (isActionResponse<T>(response)) {
            const results = response.results;
            if (!results) {
                return null;
            }
            if (results.length !== requests.length) {
                throw new Error(`The action service did not return responses for each request.`);
            }
            return results[0] as T[];
        } else if (response !== null) {
            throw new Error(`Unknown return type from action service`);
        }
        return null;
    }

    /**
     * @deprecated this does not offer the handle_separately route option, which is vital for certain types of bulk requests, it's better to use `createFromArray` instead.
     */
    public create<T>(...requests: ActionRequest[]): Action<T> {
        return new Action<T>(r => this.sendRequests<T>(r), requests);
    }

    public createFromArray<T>(requests: ActionRequest[], handle_separately = false): Action<T> {
        return new Action<T>(r => this.sendRequests<T>(r, handle_separately), requests);
    }

    private isAllowed(): boolean {
        const functions = Object.values(this._beforeActionFnMap);
        if (!functions.length) {
            return true;
        }
        return functions.every(fn => !fn());
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////// The following methods will be removed ///////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    /**
     * @deprecated This will be removed pretty soon, use `create` instead!
     * @param action
     * @param data
     * @returns
     */
    public async sendRequest<T>(action: string, data: any): Promise<T | void> {
        const results = await this.sendRequests<T>([{ action, data: [data] }]);
        if (!results) {
            return;
        }
        if (results.length !== 1) {
            throw new Error(`The action service did not respond with exactly one response for one request.`);
        }
        return results[0];
    }

    /**
     * @deprecated This will be removed pretty soon, use `createFromArray` instead!
     * @param action
     * @param data
     * @returns
     */
    public async sendBulkRequest<T>(action: string, data: any[]): Promise<T[] | null> {
        const results = await this.sendRequests<T>([{ action, data }]);
        if (results && results.length !== data.length) {
            throw new Error(`Inner resultlength is not ${data.length} from the action service`);
        }
        return results;
    }
}
