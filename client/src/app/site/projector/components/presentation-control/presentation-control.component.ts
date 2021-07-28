import { Component, Input } from '@angular/core';

import { combineLatest, merge, Observable } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { ProjectionRepositoryService } from 'app/core/repositories/projector/projection-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
import { ViewProjection } from '../../models/view-projection';
import { ViewProjector } from '../../models/view-projector';

/**
 * The presentation controls.
 */
@Component({
    selector: 'os-presentation-control',
    templateUrl: './presentation-control.component.html',
    styleUrls: ['./presentation-control.component.scss']
})
export class PresentationControlComponent extends BaseComponent {
    @Input()
    public set projectorObservable(projector$: Observable<ViewProjector | null>) {
        const trigger$ = merge(
            projector$,
            projector$.pipe(mergeMap(projector => projector?.current_projections_as_observable || []))
        );

        this.projections$ = combineLatest([projector$, trigger$]).pipe(
            map((data: [ViewProjector, any]) =>
                (data[0]?.current_projections || []).filter(projection =>
                    this.getMediafile(projection)?.isProjectable()
                )
            )
        );
    }

    public projections$: Observable<ViewProjection[]>;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private projectionRepo: ProjectionRepositoryService
    ) {
        super(componentServiceCollector);
    }

    public getMediafile(projection: ViewProjection): ViewMediafile | null {
        if (projection.content_object instanceof ViewMediafile) {
            return projection.content_object;
        } else {
            return null;
        }
    }

    /**
     * @returns the currently used page number (1 in case of unnumbered elements)
     */
    public getPage(projection: ViewProjection): number {
        return projection.options.page || 1;
    }

    /**
     * moves the projected forward by one page (if not already at end)
     *
     * @param element
     */
    public pdfForward(projection: ViewProjection): void {
        if (this.getPage(projection) < this.getMediafile(projection).pages) {
            this.pdfSetPage(projection, this.getPage(projection) + 1);
        }
    }

    /**
     * moves the projected one page backwards (if not already at beginnning)
     *
     * @param element
     */
    public pdfBackward(projection: ViewProjection): void {
        if (this.getPage(projection) > 1) {
            this.pdfSetPage(projection, this.getPage(projection) - 1);
        }
    }

    /**
     * Moves the element to a specific given page. If the number given is greater
     * than the amount of element pages, it does nothing
     *
     * @param element
     * @param page
     */
    public pdfSetPage(projection: ViewProjection, page: number): void {
        projection.options.page = page;
        this.updateProjectionOptions(projection);
    }

    public zoom(projection: ViewProjection, direction: 'in' | 'out' | 'reset'): void {
        if (direction === 'reset') {
            projection.options.zoom = 0;
        } else if (direction === 'in') {
            projection.options.zoom = (projection.options.zoom || 0) + 1;
        } else if (direction === 'out') {
            projection.options.zoom = (projection.options.zoom || 0) - 1;
        }
        this.updateProjectionOptions(projection);
    }

    public fullscreen(projection: ViewProjection): void {
        projection.options.fullscreen = !projection.options.fullscreen;
        this.updateProjectionOptions(projection);
    }

    private updateProjectionOptions(projection: ViewProjection): void {
        this.projectionRepo.updateOption(projection);
    }
}
