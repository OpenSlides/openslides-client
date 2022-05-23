import { Component, Input } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { PollDialogData } from 'src/app/site/pages/meetings/modules/poll/definitions';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

import { MotionPollService } from '../../../../modules/motion-poll/services/motion-poll.service/motion-poll.service';
import { MotionPollDialogService } from '../../../../modules/motion-poll/services/motion-poll-dialog.service';

@Component({
    selector: `os-motion-manage-polls`,
    templateUrl: `./motion-manage-polls.component.html`,
    styleUrls: [`./motion-manage-polls.component.scss`]
})
export class MotionManagePollsComponent {
    @Input()
    public motion!: ViewMotion;

    public readonly permission = Permission;

    public get canStateHavePolls(): boolean {
        return this.motion.state?.allow_create_poll || false;
    }

    public constructor(
        private motionPollService: MotionPollService,
        private pollDialog: MotionPollDialogService,
        private pollController: PollControllerService
    ) {}

    public async openDialog(): Promise<void> {
        const defaultPollData = this.motionPollService.getDefaultPollData(this.motion);
        const dialogData: Partial<PollDialogData> = {
            content_object_id: this.motion.fqid,
            content_object: this.motion,
            ...defaultPollData
        };

        this.pollDialog.open(dialogData);
    }

    public onEditPoll(id: Id): void {
        const viewPoll = this.pollController.getViewModel(id)!;
        this.pollDialog.open(viewPoll);
    }
}
