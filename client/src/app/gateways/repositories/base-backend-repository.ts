import { inject } from '@angular/core';
import { HasSequentialNumber, Identifiable } from 'src/app/domain/interfaces';
import { OnAfterAppsLoaded } from 'src/app/infrastructure/definitions/hooks/after-apps-loaded';
import { ListUpdateData } from 'src/app/infrastructure/utils';

import { Id } from '../../domain/definitions/key-types';
import { BaseModel } from '../../domain/models/base/base-model';
import { BaseViewModel } from '../../site/base/base-view-model';
import { Action, ActionService } from '../actions';
import { ActionRequest } from '../actions/action-utils';
import { BaseRepository } from './base-repository';

export interface CreateResponse extends Identifiable, HasSequentialNumber {}

export interface CanPerformListUpdates<M extends BaseModel, UpdateResult = any> {
    listUpdate: (data: ListUpdateData<M>, meeting_id?: Id) => Action<UpdateResult>;
}

export function canPerformListUpdates(repo: any): repo is CanPerformListUpdates<any> {
    return repo.listUpdate && typeof repo.listUpdate === `function`;
}

export abstract class BaseBackendRepository<V extends BaseViewModel, M extends BaseModel>
    extends BaseRepository<V, M>
    implements OnAfterAppsLoaded
{
    protected actions = inject(ActionService);

    protected createAction<T = void>(
        name: string,
        payload: unknown | unknown[],
        handle_separately?: boolean
    ): Action<T> {
        if (!Array.isArray(payload)) {
            payload = [payload];
        }
        return this.actions.createFromArray([{ action: name, data: payload as unknown[] }], handle_separately ?? false);
    }

    /////////////////////////////////////////////////////////////////////////////////////
    /////////////////////// The following methods will be removed ///////////////////////
    /////////////////////////////////////////////////////////////////////////////////////

    /**
     * @deprecated This will be removed pretty soon, use `createAction` instead!
     * @param action
     * @param payload
     * @returns
     */
    protected async sendActionToBackend<T>(action: string, payload: T): Promise<any> {
        try {
            const results = await this.actions.createFromArray([{ action, data: [payload] }]).resolve();
            if (results) {
                if (results.length !== 1) {
                    throw new Error(`The action service did not respond with exactly one response for the request.`);
                }
                return results[0];
            }
        } catch (e) {
            throw e;
        }
    }

    /**
     * @deprecated This will be removed pretty soon, use `createAction` instead!
     * @param action
     * @param payload
     * @returns
     */
    protected async sendBulkActionToBackend<T>(action: string, payload: T[]): Promise<any> {
        try {
            return await this.actions.createFromArray<any>([{ action, data: payload }]).resolve();
        } catch (e) {
            throw e;
        }
    }

    /**
     * @deprecated This will be removed pretty soon, use `createAction` instead!
     * @param actions
     * @returns
     */
    protected async sendActionsToBackend(actions: ActionRequest[], handle_separately = false): Promise<any> {
        try {
            return await this.actions.sendRequests(actions, handle_separately);
        } catch (e) {
            throw e;
        }
    }
}
