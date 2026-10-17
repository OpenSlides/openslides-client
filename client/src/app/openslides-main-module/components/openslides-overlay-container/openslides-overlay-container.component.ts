import { Component, ViewContainerRef } from '@angular/core';
import { DomService } from '@app/openslides-main-module/services/dom.service';
import { SpinnerService } from '@app/site/modules/global-spinner';

@Component({
    selector: `os-openslides-overlay-container`,
    template: ``
})
export class OpenSlidesOverlayContainerComponent {
    public constructor(viewContainer: ViewContainerRef, domService: DomService, spinnerService: SpinnerService) {
        domService.setViewContainer(viewContainer);
        spinnerService.show(undefined, { hideWhenStable: true });
    }
}
