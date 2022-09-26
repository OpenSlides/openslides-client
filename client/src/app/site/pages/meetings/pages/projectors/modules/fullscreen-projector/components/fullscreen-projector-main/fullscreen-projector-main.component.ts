import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Id } from 'src/app/domain/definitions/key-types';
import { Projector } from 'src/app/domain/models/projector/projector';
import { BaseModelRequestHandlerComponent } from 'src/app/site/base/base-model-request-handler.component';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';
import { ModelRequestService } from 'src/app/site/services/model-request.service';
import { DEFAULT_FIELDSET } from 'src/app/site/services/model-request-builder';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';

import { PROJECTOR_DETAIL_SUBSCRIPTION } from '../../../../view-models/view-projector';

@Component({
    selector: `os-fullscreen-projector-main`,
    templateUrl: `./fullscreen-projector-main.component.html`,
    styleUrls: [`./fullscreen-projector-main.component.scss`]
})
export class FullscreenProjectorMainComponent extends BaseModelRequestHandlerComponent {
    private _projectorId: Id | null = null;

    public constructor(
        modelRequestService: ModelRequestService,
        router: Router,
        openslidesRouter: OpenSlidesRouterService,
        private sequentialNumberMapping: SequentialNumberMappingService
    ) {
        super(modelRequestService, router, openslidesRouter);
    }

    protected override onParamsChanged(params: any, oldParams: any): void {
        if (params[`id`] !== oldParams[`id`] || params[`meetingId`] !== oldParams[`meetingId`]) {
            this.sequentialNumberMapping
                .getIdObservableBySequentialNumber({
                    collection: Projector.COLLECTION,
                    meetingId: +params[`meetingId`],
                    sequentialNumber: +params[`id`]
                })
                .subscribe(id => {
                    if (id && this._projectorId !== id) {
                        this._projectorId = id;
                        this.doFullscreenProjectorSubscription();
                    }
                });
        }
    }

    private doFullscreenProjectorSubscription(): void {
        if (this._projectorId) {
            this.subscribeTo({
                modelRequest: {
                    viewModelCtor: ViewProjector,
                    ids: [this._projectorId],
                    fieldset: DEFAULT_FIELDSET
                },
                subscriptionName: PROJECTOR_DETAIL_SUBSCRIPTION,
                hideWhenDestroyed: true
            });
        }
    }
}
