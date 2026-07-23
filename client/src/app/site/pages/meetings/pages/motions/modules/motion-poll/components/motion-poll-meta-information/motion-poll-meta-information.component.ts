import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePollMetaInformationComponent } from '@app/site/pages/meetings/modules/poll/base/base-poll-meta-information.component';

@Component({
    selector: `os-motion-poll-meta-information`,
    templateUrl: `./motion-poll-meta-information.component.html`,
    styleUrls: [`./motion-poll-meta-information.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class MotionPollMetaInformationComponent extends BasePollMetaInformationComponent {}
