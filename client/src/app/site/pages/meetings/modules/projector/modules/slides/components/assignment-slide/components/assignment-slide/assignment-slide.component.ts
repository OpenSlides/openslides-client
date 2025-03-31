import { Component } from '@angular/core';

import { BaseSlideComponent } from '../../../../base/base-slide-component';
import { AssignmentSlideData } from '../../assignment-slide-data';

@Component({
    selector: `os-assignment-slide`,
    templateUrl: `./assignment-slide.component.html`,
    styleUrls: [`./assignment-slide.component.scss`],
    standalone: false
})
export class AssignmentSlideComponent extends BaseSlideComponent<AssignmentSlideData> {}
