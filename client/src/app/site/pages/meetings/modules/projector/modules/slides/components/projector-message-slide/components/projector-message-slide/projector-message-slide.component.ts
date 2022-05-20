import { Component } from '@angular/core';

import { BaseSlideComponent } from '../../../../base/base-slide-component';
import { ProjectorMessageSlideData } from '../../projector-message-slide-data';

@Component({
    selector: `os-projector-message-slide`,
    templateUrl: `./projector-message-slide.component.html`,
    styleUrls: [`./projector-message-slide.component.scss`]
})
export class ProjectorMessageSlideComponent extends BaseSlideComponent<ProjectorMessageSlideData> {}
