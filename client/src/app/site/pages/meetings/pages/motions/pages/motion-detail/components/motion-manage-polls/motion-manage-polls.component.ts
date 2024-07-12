import { Component, Input } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

import { MotionPollDialogService } from '../../../../modules/motion-poll/services/motion-poll-dialog.service';

@Component({
    selector: `os-motion-manage-polls`,
    templateUrl: `./motion-manage-polls.component.html`,
    styleUrls: [`./motion-manage-polls.component.scss`]
})
export class MotionManagePollsComponent {
    @Input()
    public motion!: ViewMotion;

    @Input()
    public hideAdd: boolean;

    public constructor(private pollDialog: MotionPollDialogService, private pollController: PollControllerService) {}

    public onEditPoll(id: Id): void {
        const viewPoll = this.pollController.getViewModel(id)!;
        this.pollDialog.open(viewPoll);
    }
}
