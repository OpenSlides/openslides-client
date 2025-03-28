import { Component } from '@angular/core';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import { ProjectorCountdownSlideData } from '../projector-countdown-slide-data';

@Component({
    selector: `os-projector-countdown-slide`,
    templateUrl: `./projector-countdown-slide.component.html`,
    styleUrls: [`./projector-countdown-slide.component.scss`],
    standalone: false
})
export class CountdownSlideComponent extends BaseSlideComponent<ProjectorCountdownSlideData> {
    public get isFullscreen(): boolean {
        return this.data.options[`fullscreen`];
    }

    public get displayType(): any {
        return this.data.options[`displayType`];
    }
}
