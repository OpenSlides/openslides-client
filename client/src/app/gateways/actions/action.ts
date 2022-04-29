import { ActionRequest } from './action-utils';

export class Action<T = void> {
    private _actions: ActionRequest[];
    private _sendActionFn: (requests: ActionRequest[]) => Promise<T[]>;

    public constructor(sendActionFn: (requests: ActionRequest[]) => Promise<T[]>, ...actions: ActionRequest[]) {
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

    public async resolve(): Promise<T[] | void> {
        const result = await this._sendActionFn(this._actions).then(result => {
            if (Array.isArray(result)) {
                return result.flatMap(value => value);
            } else {
                return undefined;
            }
        });
        if (result) {
            return result;
        }
    }

    public static from<U = void>(...actions: Action<any>[]): Action<U> {
        return actions[0].concat(...actions.slice(1));
    }
}

export const EmptyAction = new Action(async () => []);
