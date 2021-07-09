import { Component, Input } from '@angular/core';

import { MediafileRepositoryService } from 'app/core/repositories/mediafiles/mediafile-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMediafile } from 'app/site/mediafiles/models/view-mediafile';
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
    /**
     * The projector.
     */
    private _projector: ViewProjector;

    @Input()
    public set projector(projector: ViewProjector) {
        this._projector = projector;
        this.updateElements();
    }

    public get projector(): ViewProjector {
        return this._projector;
    }

    // All mediafile elements.
    public elements: any /*MediafileProjectorElement*/[] = [];

    /**
     * Constructor
     *
     * @param titleService
     * @param translate
     * @param matSnackBar
     * @param mediafileRepo
     * @param slideManager
     * @param projectorService
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private mediafileRepo: MediafileRepositoryService
    ) {
        super(componentServiceCollector);
    }

    /**
     * Updates incoming elements
     */
    private updateElements(): void {
        /*this.elements = this.projector.elements.filter(element => {
            if (element.name !== Mediafile.COLLECTION || !element.id) {
                return false;
            }
            const mediafile = this.mediafileRepo.getViewModel(element.id);
            return !!mediafile && mediafile.isProjectable();
        });*/
    }

    public getMediafile(element: any /*MediafileProjectorElement*/): ViewMediafile {
        return this.mediafileRepo.getViewModel(element.id);
    }

    /**
     * @returns the currently used page number (1 in case of unnumbered elements)
     */
    public getPage(element: any /*MediafileProjectorElement*/): number {
        return element.page || 1;
    }

    /**
     * moves the projected forward by one page (if not already at end)
     *
     * @param element
     */
    public pdfForward(element: any /*MediafileProjectorElement*/): void {
        if (this.getPage(element) < this.getMediafile(element).pages) {
            this.pdfSetPage(element, this.getPage(element) + 1);
        }
    }

    /**
     * moves the projected one page backwards (if not already at beginnning)
     *
     * @param element
     */
    public pdfBackward(element: any /*MediafileProjectorElement*/): void {
        if (this.getPage(element) > 1) {
            this.pdfSetPage(element, this.getPage(element) - 1);
        }
    }

    /**
     * Moves the element to a specific given page. If the number given is greater
     * than the amount of element pages, it does nothing
     *
     * @param element
     * @param page
     */
    public pdfSetPage(element: any /*MediafileProjectorElement*/, page: number): void {
        if (this.getMediafile(element).pages >= page) {
            element.page = page;
            this.updateElement(element);
        }
    }

    public zoom(element: any /*MediafileProjectorElement*/, direction: 'in' | 'out' | 'reset'): void {
        if (direction === 'reset') {
            element.zoom = 0;
        } else if (direction === 'in') {
            element.zoom = (element.zoom || 0) + 1;
        } else if (direction === 'out') {
            element.zoom = (element.zoom || 0) - 1;
        }
        this.updateElement(element);
    }

    public fullscreen(element: any /*MediafileProjectorElement*/): void {
        element.fullscreen = !element.fullscreen;
        this.updateElement(element);
    }

    private updateElement(element: any /*MediafileProjectorElement*/): void {
        /*const idElement = this.slideManager.getIdentifiableProjectorElement(element);
        this.projectorService.updateElement(this.projector.projector, idElement).catch(this.raiseError);*/
        throw new Error('TODO');
    }
}
