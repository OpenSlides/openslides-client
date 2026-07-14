import { Injectable } from '@angular/core';
import { BasePollDialogService } from '@app/site/pages/meetings/modules/poll/base/base-poll-dialog.service';
import { ViewMotion } from '@app/site/pages/meetings/pages/motions';

import { MotionPollDialogComponent } from '../../components/motion-poll-dialog/motion-poll-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class MotionPollDialogService extends BasePollDialogService<ViewMotion> {
    protected getComponent(): typeof MotionPollDialogComponent {
        return MotionPollDialogComponent;
    }
}
