import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { CollectionMapperService } from 'app/core/core-services/collection-mapper.service';
import { BasePollDialogService } from 'app/core/ui-services/base-poll-dialog.service';
import { AssignmentPollDialogComponent } from 'app/site/assignments/components/assignment-poll-dialog/assignment-poll-dialog.component';
import { AssignmentPollService } from './assignment-poll.service';
import { ViewAssignmentPoll } from '../models/view-assignment-poll';

/**
 * Subclassed to provide the right `PollService` and `DialogComponent`
 */
@Injectable({
    providedIn: 'root'
})
export class AssignmentPollDialogService extends BasePollDialogService<ViewAssignmentPoll, AssignmentPollService> {
    protected dialogComponent = AssignmentPollDialogComponent;

    public constructor(dialog: MatDialog, mapper: CollectionMapperService) {
        super(dialog, mapper);
    }
}
