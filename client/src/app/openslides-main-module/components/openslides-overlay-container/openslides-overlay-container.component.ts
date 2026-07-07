import { Component, inject, ViewContainerRef } from '@angular/core';
import { DomService } from 'src/app/openslides-main-module/services/dom.service';
import { SpinnerService } from 'src/app/site/modules/global-spinner';

@Component({
    selector: `os-openslides-overlay-container`,
    templateUrl: `./openslides-overlay-container.component.html`,
    styleUrls: [`./openslides-overlay-container.component.scss`],
    standalone: false
})
export class OpenSlidesOverlayContainerComponent {
    private _viewContainer = inject(ViewContainerRef);
    private _domService = inject(DomService);
    private _spinnerService = inject(SpinnerService);

    public constructor() {
        this._domService.setViewContainer(this._viewContainer);
        this._spinnerService.show(undefined, { hideWhenStable: true });
    }
}
