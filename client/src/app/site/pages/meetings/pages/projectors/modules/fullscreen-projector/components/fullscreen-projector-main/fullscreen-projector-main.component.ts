import { Component, inject } from '@angular/core';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';

import { getProjectorSubscriptionConfig } from '../../../../projectors.subscription';
import { ViewProjector } from '../../../../view-models';

@Component({
    selector: `os-fullscreen-projector-main`,
    templateUrl: `./fullscreen-projector-main.component.html`,
    styleUrls: [`./fullscreen-projector-main.component.scss`]
})
export class FullscreenProjectorMainComponent extends BaseModelRequestHandlerComponent {
    private sequentialNumberMappingService = inject(SequentialNumberMappingService);

    protected override onParamsChanged(params: any, _oldParams?: any): void {
        if (params[`id`]) {
            this.sequentialNumberMappingService
                .getIdBySequentialNumber({
                    collection: ViewProjector.COLLECTION,
                    meetingId: params[`meetingId`],
                    sequentialNumber: +params[`id`]
                })
                .then(id => {
                    if (id) {
                        this.subscribeTo(getProjectorSubscriptionConfig(id), { hideWhenMeetingChanged: true });
                    }
                });
        }
    }
}
