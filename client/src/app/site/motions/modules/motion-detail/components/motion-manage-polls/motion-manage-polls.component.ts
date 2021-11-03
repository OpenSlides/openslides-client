import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PollDialogData } from 'app/core/ui-services/base-poll-dialog.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseComponent } from 'app/site/base/components/base.component';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { MotionPollService } from 'app/site/motions/services/motion-poll.service';
import { MotionPollDialogService } from 'app/site/motions/services/motion-poll-dialog.service';

@Component({
    selector: `os-motion-manage-polls`,
    templateUrl: `./motion-manage-polls.component.html`,
    styleUrls: [`./motion-manage-polls.component.scss`]
})
export class MotionManagePollsComponent extends BaseComponent {
    @Input()
    public motion: ViewMotion;

    public constructor(
        componentCollector: ComponentServiceCollector,
        translate: TranslateService,
        private motionPollService: MotionPollService,
        private pollDialog: MotionPollDialogService
    ) {
        super(componentCollector, translate);
    }

    public openDialog(): void {
        const defaultPollData = this.motionPollService.getDefaultPollData(this.motion);
        const dialogData: Partial<PollDialogData> = {
            content_object_id: this.motion.fqid,
            content_object: this.motion,
            ...defaultPollData
        };

        this.pollDialog.openDialog(dialogData);
    }
}
