import { Component, Input } from '@angular/core';

import { Id } from 'app/core/definitions/key-types';
import { PollDialogData } from 'app/core/ui-services/base-poll-dialog.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { MotionPollDialogService } from 'app/site/motions/services/motion-poll-dialog.service';
import { MotionPollService } from 'app/site/motions/services/motion-poll.service';

@Component({
    selector: 'os-motion-manage-polls',
    templateUrl: './motion-manage-polls.component.html',
    styleUrls: ['./motion-manage-polls.component.scss']
})
export class MotionManagePollsComponent extends BaseComponent {
    @Input()
    public motion: ViewMotion;

    public constructor(
        componentCollector: ComponentServiceCollector,
        private motionPollService: MotionPollService,
        private pollDialog: MotionPollDialogService
    ) {
        super(componentCollector);
    }

    public openDialog(): void {
        const defaultPollData = this.motionPollService.getDefaultPollData(this.motion);
        const dialogData: PollDialogData = {
            content_object_id: this.motion.fqid,
            content_object: this.motion,
            pollmethod: defaultPollData.pollmethod,
            title: defaultPollData.title,
            type: defaultPollData.type,
            isPublished: defaultPollData.isPublished,
            majority_method: defaultPollData.majority_method,
            onehundred_percent_base: defaultPollData.onehundred_percent_base
        };

        this.pollDialog.openDialog(dialogData);
    }
}
