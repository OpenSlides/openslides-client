import { Component, OnInit } from '@angular/core';
import { ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';
import { DomService } from '../../services/dom.service';
import { FullscreenProjectorComponent } from '../fullscreen-projector/fullscreen-projector.component';
import { SequentialNumberMappingService } from 'src/app/site/pages/meetings/services/sequential-number-mapping.service';
import { OpenSlidesRouterService } from 'src/app/site/services/openslides-router.service';
import { Id } from 'src/app/domain/definitions/key-types';

@Component({
    selector: 'os-fullscreen-projector-detail',
    templateUrl: './fullscreen-projector-detail.component.html',
    styleUrls: ['./fullscreen-projector-detail.component.scss']
})
export class FullscreenProjectorDetailComponent implements OnInit {
    private _projectorId: Id | null = null;
    /**
     * Constructor. Updates the projector dimensions on a resize.
     */
    public constructor(
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
                    .getIdObservableBySequentialNumber({
                        collection: ViewProjector.COLLECTION,
                        meetingId: params[`meetingId`],
                        sequentialNumber: +params[`id`]
                    })
                    .subscribe(id => {
                        if (id) {
                            this._projectorId = id;
                            this.domService.appendComponentToBody(FullscreenProjectorComponent, {
                                id: this._projectorId
                            });
                        }
                    });
            }
        });
    }
}
