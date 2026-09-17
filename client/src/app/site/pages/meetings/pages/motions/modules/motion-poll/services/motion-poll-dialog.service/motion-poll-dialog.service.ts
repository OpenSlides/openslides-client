import { Service } from '@angular/core';
import { BasePollDialogService } from '@app/site/pages/meetings/modules/poll/base/base-poll-dialog.service';
import { ViewMotion } from '@app/site/pages/meetings/pages/motions';

import { MotionPollDialogComponent } from '../../components/motion-poll-dialog/motion-poll-dialog.component';

@Service()
export class MotionPollDialogService extends BasePollDialogService<ViewMotion> {
    protected getComponent(): typeof MotionPollDialogComponent {
        return MotionPollDialogComponent;
    }
}
