import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';

import { getProjectorSubscriptionConfig } from '../../../../projectors.subscription';
import { ViewProjector } from '../../../../view-models';

@Component({
    selector: `os-fullscreen-projector-main`,
    templateUrl: `./fullscreen-projector-main.component.html`,
    styleUrls: [`./fullscreen-projector-main.component.scss`],
    standalone: false
})
export class FullscreenProjectorMainComponent extends BaseModelRequestHandlerComponent {
    public constructor(private sequentialNumberMappingService: SequentialNumberMappingService) {
        super();
    }

    protected override onShouldCreateModelRequests(params: any, meetingId: Id): void {
        if (params[`id`]) {
            this.sequentialNumberMappingService
                .getIdBySequentialNumber({
                    collection: ViewProjector.COLLECTION,
                    meetingId,
                    sequentialNumber: +params[`id`]
                })
                .then(id => {
                    if (id) {
                        this.subscribeTo(getProjectorSubscriptionConfig(id), { hideWhenDestroyed: true });
                    }
                });
        }
    }
}
