import { Component } from '@angular/core';

import { BaseSlideComponent } from 'app/slides/base-slide-component';
import { ProjectorCountdownSlideData } from './projector-countdown-slide-data';

@Component({
    selector: 'os-projector-countdown-slide',
    templateUrl: './projector-countdown-slide.component.html',
    styleUrls: ['./projector-countdown-slide.component.scss']
})
export class CountdownSlideComponent extends BaseSlideComponent<ProjectorCountdownSlideData> {}
