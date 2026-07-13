import { Component, ViewContainerRef, ChangeDetectionStrategy } from '@angular/core';
import { DomService } from 'src/app/openslides-main-module/services/dom.service';
import { SpinnerService } from 'src/app/site/modules/global-spinner';

@Component({
    selector: `os-openslides-overlay-container`,
    templateUrl: `./openslides-overlay-container.component.html`,
    styleUrls: [`./openslides-overlay-container.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class OpenSlidesOverlayContainerComponent {
    public constructor(_viewContainer: ViewContainerRef, _domService: DomService, _spinnerService: SpinnerService) {
        _domService.setViewContainer(_viewContainer);
        _spinnerService.show(undefined, { hideWhenStable: true });
    }
}
