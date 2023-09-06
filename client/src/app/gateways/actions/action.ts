import { ActionRequest } from './action-utils';

export class Action<T = void> {
    private _actions: ActionRequest[];
    private _sendActionFn: (requests: ActionRequest[]) => Promise<T[]>;

    public constructor(sendActionFn: (requests: ActionRequest[]) => Promise<T[]>, actions: ActionRequest[] = []) {
        this._actions = actions.filter(action => !!action?.data?.length);
        this._sendActionFn = sendActionFn;
    }

    public concat(...actions: (Action<any | any[]> | ActionRequest | null)[]): Action<T> {
        actions = actions.filter(action => !!action && (action[`data`]?.length || action[`_actions`]?.length));
        if (actions.length === 0) {
            return this;
        }
        const concatedActions = this._actions.concat(
            actions
                .filter(action => action !== null)
                .flatMap(action => {
                    if (action instanceof Action) {
                        return action._actions;
                    } else {
                        return [action];
                    }
                })
        );
        return new Action(
            this._sendActionFn ?? (actions.find(action => action instanceof Action) as Action<T>)?._sendActionFn,
            concatedActions
        );
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
        if (actions.length) {
            return actions[0].concat(...actions.slice(1));
        }
        return createEmptyAction();
    }
}

export const createEmptyAction = () => new Action(async () => []);
