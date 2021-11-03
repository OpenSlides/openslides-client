import { Injectable } from '@angular/core';

import { AutoupdateService, ModelSubscription } from './autoupdate.service';
import { SimplifiedModelRequest } from './model-request-builder.service';

/**
 * Encapsulates model requesting from autoupdates
 * Allows other services to request models in the same way as components do
 * (any export service) and hides the autoupdate service from all components
 */
@Injectable({
    providedIn: `root`
})
export class ModelRequestService {
    public constructor(private autoupdateService: AutoupdateService) {}

    public async instant(request: SimplifiedModelRequest, description: string): Promise<void> {
        return await this.autoupdateService.instant(request, description);
    }

    public async subscribe(
        simplifiedModelRequest: SimplifiedModelRequest,
        description: string
    ): Promise<ModelSubscription> {
        return this.autoupdateService.subscribe(simplifiedModelRequest, description);
    }
}
