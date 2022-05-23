import { Component } from '@angular/core';

import { BaseSlideComponent } from '../../../base/base-slide-component';
import { UserSlideData } from '../user-slide-data';

@Component({
    selector: `os-user-slide`,
    templateUrl: `./user-slide.component.html`,
    styleUrls: [`./user-slide.component.scss`]
})
export class UserSlideComponent extends BaseSlideComponent<UserSlideData> {}
