import { Injectable } from '@angular/core';

import { ActionService } from './action.service';
import { BaseModel } from '../../shared/models/base/base-model';
import { Identifiable } from '../../shared/models/base/identifiable';

/**
 * Send data back to server. Cares about the right REST routes.
 *
 * Contrast to dataStore service
 */
@Injectable({
    providedIn: 'root'
})
export class DataSendService {
    /**
     * Construct a DataSendService
     *
     * @param httpService The HTTP Service
     */
    public constructor(private actions: ActionService) {}

    /**
     * Sends a post request with the model to the server to create it.
     *
     * @param model The model to create.
     */
    public async createModel(model: BaseModel): Promise<Identifiable> {
        return await this.actions.create(model.collection, [model]);
    }

    /**
     * Function to fully update a model on the server.
     *
     * @param model The model that is meant to be changed.
     */
    public async updateModel(model: BaseModel): Promise<void> {
        await this.actions.update(model.collection, [model]);
    }

    /**
     * Updates a model partially on the server.
     *
     * @param model The model to partially update.
     */
    public async partialUpdateModel(model: BaseModel): Promise<void> {
        // const restPath = `/rest/${model.collection}/${model.id}/`;
        // await this.httpService.patch(restPath, model);
    }

    /**
     * Deletes the given model on the server.
     *
     * @param model the model that shall be deleted.
     */
    public async deleteModel(model: BaseModel): Promise<void> {
        await this.actions.delete(model.collection, model.id);
    }
}
