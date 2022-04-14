import { Injectable } from '@angular/core';

import { ProcessError } from '../errors/process-error';
import { ArchiveStatusService } from './archive-status.service';
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

export class Action<T = void> extends Promise<T[]> {
    private _actions: ActionRequest[];
    private _sendActionFn: (requests: ActionRequest[]) => Promise<T[]>;

    public constructor(sendActionFn: (requests: ActionRequest[]) => Promise<T[]>, ...actions: ActionRequest[]) {
        let resolveFn: (value: T[]) => void;
        super(resolve => {
            resolveFn = value => (console.log(`Action is resolved`, value), resolve(value));
        });
        this._actions = actions.filter(action => !!action.data?.length);
        this._sendActionFn = sendActionFn;
    }

    public concat(...actions: (Action<any | any[]> | ActionRequest)[]): Action<T> {
        if (actions.length === 0) {
            return this;
        }
        const concatedActions = actions
            .flatMap(action => {
                if (action instanceof Action) {
                    return action._actions;
                } else {
                    return [action];
                }
            })
            .concat(this._actions);
        return new Action(this._sendActionFn, ...concatedActions);
    }

    public async resolve(): Promise<T[] | T> {
        return await this._sendActionFn(this._actions).then(result => {
            if (result) {
                return result.flatMap(value => value);
            } else {
                return null;
            }
        });
    }
}

@Injectable({
    providedIn: `root`
})
export class ActionService {
    private readonly ACTION_URL = `/system/action/handle_request`;

    private constructor(private http: HttpService, private archiveService: ArchiveStatusService) {}

    public async sendRequest<T>(action: string, data: any): Promise<T | null> {
        const results = await this.sendRequests<T>([{ action, data: [data] }]);
        if (!results) {
            return null;
        }
        if (results.length !== 1) {
            throw new Error(`The action service did not respond with exactly one response for one request.`);
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
        if (this.archiveService.isArchived) {
            throw new ProcessError(`You cannot make changes while a meeting is archived`);
        }
        console.log(`send requests:`, requests);
        const response = await this.http.post<T>(this.ACTION_URL, requests);
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
            return results[0];
        }
        throw new Error(`Unknown return type from action service`);
    }

    public create<T>(...requests: ActionRequest[]): Action<T> {
        return new Action<T>(r => this.sendRequests<T>(r), ...requests);
    }
}
