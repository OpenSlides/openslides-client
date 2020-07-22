import { Injectable } from '@angular/core';

import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { SimplifiedModelRequest } from './model-request-builder.service';

/**
 * Encapsulates model requesting from autoupdates
 * Allows other services to request models in the same way as components do
 * (any export service) and hides the autoupdate service from all components
 */
@Injectable({
    providedIn: 'root'
})
export class ModelRequestService {
    public constructor(private autoupdateService: AutoupdateService) {}

    public async requestModels(simplifiedModelRequest: SimplifiedModelRequest): Promise<ModelSubscription> {
        return this.autoupdateService.simpleRequest(simplifiedModelRequest);
    }
}
