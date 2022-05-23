import { Injectable } from '@angular/core';
import { BasePollDialogService } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';

import { MotionPollDialogComponent } from '../../components/motion-poll-dialog/motion-poll-dialog.component';
import { MotionPollServiceModule } from '../motion-poll-service.module';

@Injectable({
    providedIn: MotionPollServiceModule
})
export class MotionPollDialogService extends BasePollDialogService<ViewMotion> {
    protected getComponent(): typeof MotionPollDialogComponent {
        return MotionPollDialogComponent;
    }
}
