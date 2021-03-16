import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { BasePollDialogService } from 'app/core/ui-services/base-poll-dialog.service';
import { MotionPollDialogComponent } from 'app/site/motions/modules/motion-poll/motion-poll-dialog/motion-poll-dialog.component';

/**
 * Subclassed to provide the right `PollService` and `DialogComponent`
 */
@Injectable({
    providedIn: 'root'
})
export class MotionPollDialogService extends BasePollDialogService {
    protected dialogComponent = MotionPollDialogComponent;

    public constructor(dialog: MatDialog, repo: PollRepositoryService) {
        super(dialog, repo);
    }
}
