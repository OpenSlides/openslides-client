import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { BasePollDialogService } from 'app/core/ui-services/base-poll-dialog.service';
import { AssignmentPollDialogComponent } from '../components/assignment-poll-dialog/assignment-poll-dialog.component';

/**
 * Subclassed to provide the right `PollService` and `DialogComponent`
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentPollDialogService extends BasePollDialogService {
    protected dialogComponent = AssignmentPollDialogComponent;

    public constructor(dialog: MatDialog, repo: PollRepositoryService) {
        super(dialog, repo);
    }
}
