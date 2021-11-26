import { Component } from '@angular/core';

import { BasePollMetaInformationComponent } from '../../../../polls/components/base-poll-meta-information.component';

@Component({
    selector: `os-motion-poll-meta-information`,
    templateUrl: `./motion-poll-meta-information.component.html`,
    styleUrls: [`./motion-poll-meta-information.component.scss`]
})
export class MotionPollMetaInformationComponent extends BasePollMetaInformationComponent {}
