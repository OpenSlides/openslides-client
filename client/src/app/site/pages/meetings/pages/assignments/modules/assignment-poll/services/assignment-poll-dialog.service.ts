import { Service } from '@angular/core';
import { BasePollDialogService } from '@app/site/pages/meetings/modules/poll/base/base-poll-dialog.service';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';

import { AssignmentPollDialogComponent } from '../components/assignment-poll-dialog/assignment-poll-dialog.component';

@Service()
export class AssignmentPollDialogService extends BasePollDialogService<ViewAssignment> {
    protected getComponent(): typeof AssignmentPollDialogComponent {
        return AssignmentPollDialogComponent;
    }
}
