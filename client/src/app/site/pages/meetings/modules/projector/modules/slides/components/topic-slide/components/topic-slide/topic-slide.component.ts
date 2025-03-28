import { Component } from '@angular/core';

import { BaseSlideComponent } from '../../../../base/base-slide-component';
import { TopicSlideData } from '../../topic-slide-data';

@Component({
    selector: `os-topic-slide`,
    templateUrl: `./topic-slide.component.html`,
    styleUrls: [`./topic-slide.component.scss`],
    standalone: false
})
export class TopicSlideComponent extends BaseSlideComponent<TopicSlideData> {}
