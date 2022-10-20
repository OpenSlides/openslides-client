import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { DomService } from 'src/app/openslides-main-module/services/dom.service';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';

import { FullscreenProjectorComponent } from '../fullscreen-projector/fullscreen-projector.component';

@Component({
    selector: `os-fullscreen-projector-detail`,
    templateUrl: `./fullscreen-projector-detail.component.html`,
    styleUrls: [`./fullscreen-projector-detail.component.scss`]
})
export class FullscreenProjectorDetailComponent implements OnInit {
    private _projectorId: Id | null = null;
    /**
     * Constructor. Updates the projector dimensions on a resize.
     */
    public constructor(
        private viewContainer: ViewContainerRef,
        private domService: DomService,
        private osRouter: OpenSlidesRouterService,
        private sequentialNumberMappingService: SequentialNumberMappingService
    ) {}

    /**
     * Get the projector id from the URL. Loads the projector.
     * Subscribes to the operator to get his/her permissions.
     */
    public ngOnInit(): void {
        this.osRouter.currentParamMap.subscribe(params => {
            if (params[`id`]) {
                this.sequentialNumberMappingService
                    .getIdBySequentialNumber({
                        collection: ViewProjector.COLLECTION,
                        meetingId: params[`meetingId`],
                        sequentialNumber: +params[`id`]
                    })
                    .then(id => {
                        if (id) {
                            this._projectorId = id;
                            const body = this.domService.buildBodyPane(this.viewContainer);
                            body.attach(FullscreenProjectorComponent, { id: this._projectorId });
                        }
                    });
            }
        });
    }
}
