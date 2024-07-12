import { Component, Input } from '@angular/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { PollDialogData } from 'src/app/site/pages/meetings/modules/poll/definitions';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

import { MotionPollService } from '../../../../modules/motion-poll/services/motion-poll.service/motion-poll.service';
import { MotionPollDialogService } from '../../../../modules/motion-poll/services/motion-poll-dialog.service';

@Component({
    selector: `os-motion-add-poll-button`,
    templateUrl: `./motion-add-poll-button.component.html`,
    styleUrls: [`./motion-add-poll-button.component.scss`]
})
export class MotionAddPollButtonComponent {
    @Input()
    public motion!: ViewMotion;

    public readonly permission = Permission;

    public get canStateHavePolls(): boolean {
        return this.motion.state?.allow_create_poll || false;
    }

    public constructor(private motionPollService: MotionPollService, private pollDialog: MotionPollDialogService) {}

    public async openDialog(): Promise<void> {
        const defaultPollData = this.motionPollService.getDefaultPollData(this.motion);
        const dialogData: Partial<PollDialogData> = {
            content_object_id: this.motion.fqid,
            content_object: this.motion,
            ...defaultPollData
        };

        this.pollDialog.open(dialogData);
    }
}
