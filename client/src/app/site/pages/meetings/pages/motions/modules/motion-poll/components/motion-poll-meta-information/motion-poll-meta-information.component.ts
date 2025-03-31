import { Component } from '@angular/core';
import { BasePollMetaInformationComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-meta-information.component';

@Component({
    selector: `os-motion-poll-meta-information`,
    templateUrl: `./motion-poll-meta-information.component.html`,
    styleUrls: [`./motion-poll-meta-information.component.scss`],
    standalone: false
})
export class MotionPollMetaInformationComponent extends BasePollMetaInformationComponent {}
