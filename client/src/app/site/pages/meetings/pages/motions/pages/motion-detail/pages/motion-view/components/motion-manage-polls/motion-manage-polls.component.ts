import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ViewMotion } from '@app/site/pages/meetings/pages/motions';

import { ViewPoll } from '../../../../../../../polls/view-models/view-poll';
import { MotionPollDialogService } from '../../../../../../modules/motion-poll/services/motion-poll-dialog.service/motion-poll-dialog.service';

@Component({
    selector: `os-motion-manage-polls`,
    templateUrl: `./motion-manage-polls.component.html`,
    styleUrls: [`./motion-manage-polls.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MotionManagePollsComponent {
    @Input()
    public motion!: ViewMotion;

    @Input()
    public hideAdd: boolean;

    @Input()
    public inTabs: boolean;

    public constructor(private pollDialog: MotionPollDialogService) {}

    public onEditPoll(viewPoll: ViewPoll): void {
        this.pollDialog.open(viewPoll);
    }
}
