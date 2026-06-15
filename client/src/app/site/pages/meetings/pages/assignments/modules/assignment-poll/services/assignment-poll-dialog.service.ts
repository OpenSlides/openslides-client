import { Injectable } from '@angular/core';
import { BasePollDialogService } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.service';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';

import { AssignmentPollDialogComponent } from '../components/assignment-poll-dialog/assignment-poll-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class AssignmentPollDialogService extends BasePollDialogService<ViewAssignment> {
    protected getComponent(): typeof AssignmentPollDialogComponent {
        return AssignmentPollDialogComponent;
    }
}
