import { Component, Input } from '@angular/core';
import { combineLatest, map, merge, mergeMap, Observable, of } from 'rxjs';
import { ViewMediafile } from 'src/app/site/pages/meetings/pages/mediafiles';
import { ViewProjection, ViewProjector } from 'src/app/site/pages/meetings/pages/projectors';

import { ProjectionControllerService } from '../../services/projection-controller.service';

@Component({
    selector: `os-presentation-controls`,
    templateUrl: `./presentation-controls.component.html`,
    styleUrls: [`./presentation-controls.component.scss`]
})
export class PresentationControlsComponent {
    @Input()
    public set projectorObservable(projector$: Observable<ViewProjector | null>) {
        const trigger$ = merge(
            projector$,
            projector$.pipe(mergeMap(projector => projector?.current_projections_as_observable || []))
        );

        this.projections$ = combineLatest([projector$, trigger$]).pipe(
            map(([viewProjector, _]) =>
                (viewProjector?.current_projections || []).filter(projection =>
                    this.getMediafile(projection)?.isProjectable()
                )
            )
        );
    }

    public projections$: Observable<ViewProjection[]> = of([]);

    public constructor(private projectionRepo: ProjectionControllerService) {}

    public getMediafile(projection: ViewProjection): ViewMediafile | null {
        if (projection.content_object instanceof ViewMediafile) {
            return projection.content_object;
        } else {
            return null;
        }
    }

    public getPagesAmountFor(projection: ViewProjection): number {
        return this.getMediafile(projection)?.pages || 0;
    }

    /**
     * @returns the currently used page number (1 in case of unnumbered elements)
     */
    public getPage(projection: ViewProjection): number {
        return projection.options[`page`] || 1;
    }

    /**
     * moves the projected forward by one page (if not already at end)
     */
    public pdfForward(projection: ViewProjection): void {
        if (this.getPage(projection) < this.getPagesAmountFor(projection)) {
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
     */
    public pdfSetPage(projection: ViewProjection, page: number): void {
        projection.options[`page`] = page;
        this.updateProjectionOptions(projection);
    }

    public fullscreen(projection: ViewProjection): void {
        projection.options[`fullscreen`] = !projection.options[`fullscreen`];
        this.updateProjectionOptions(projection);
    }

    public isFullscreen(projection: ViewProjection): boolean {
        return projection.options[`fullscreen`];
    }

    private updateProjectionOptions(projection: ViewProjection): void {
        this.projectionRepo.updateOption(projection);
    }
}
