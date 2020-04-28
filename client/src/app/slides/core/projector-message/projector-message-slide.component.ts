import { Component, ViewEncapsulation } from '@angular/core';

import { BaseSlideComponent } from 'app/slides/base-slide-component';
import { ProjectorMessageSlideData } from './projector-message-slide-data';

@Component({
    selector: 'os-projector-message-slide',
    templateUrl: './projector-message-slide.component.html',
    styleUrls: ['./projector-message-slide.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ProjectorMessageSlideComponent extends BaseSlideComponent<ProjectorMessageSlideData> {
    public constructor() {
        super();
    }
}
