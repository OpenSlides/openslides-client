import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { PollAction } from 'app/core/actions/poll-action';
import { PollDialogData, PollDialogResult } from 'app/core/ui-services/base-poll-dialog.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseModel } from 'app/shared/models/base/base-model';
import {
    GeneralValueVerbose,
    LOWEST_VOTE_VALUE,
    PollType,
    VoteValue,
    VoteValueVerbose
} from 'app/shared/models/poll/poll-constants';
import { PollPropertyVerbose } from 'app/shared/models/poll/poll-constants';
import {
    AssignmentPollMethodVerbose,
    AssignmentPollPercentBaseVerbose,
    PollMethod
} from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { BasePollDialogComponent } from 'app/site/polls/components/base-poll-dialog.component';
import { AssignmentPollService, UnknownUserLabel } from '../../services/assignment-poll.service';

/**
 * A dialog for updating the values of an assignment-related poll.
 */
@Component({
    selector: 'os-assignment-poll-dialog',
    templateUrl: './assignment-poll-dialog.component.html',
    styleUrls: ['./assignment-poll-dialog.component.scss']
})
export class AssignmentPollDialogComponent extends BasePollDialogComponent {
    public unknownUserLabel = UnknownUserLabel;

    /**
     * List of accepted special non-numerical values.
     * See {@link PollService.specialPollVotes}
     */
    public specialValues: [number, string][];

    public generalValueVerbose = GeneralValueVerbose;
    public PollPropertyVerbose = PollPropertyVerbose;

    public AssignmentPollMethodVerbose = AssignmentPollMethodVerbose;
    public AssignmentPollPercentBaseVerbose = AssignmentPollPercentBaseVerbose;

    public readonly globalValues = ['global_yes', 'global_no', 'global_abstain'];

    /**
     * Constructor. Retrieves necessary metadata from the pollService,
     * injects the poll itself
     */
    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        formBuilder: FormBuilder,
        public dialogRef: MatDialogRef<BasePollDialogComponent>,
        public assignmentPollService: AssignmentPollService,
        @Inject(MAT_DIALOG_DATA) public pollData: PollDialogData | ViewPoll
    ) {
        super(componentServiceCollector, dialogRef, pollData, formBuilder);
    }

    public onBeforeInit(): void {
        console.log('pollData', this.pollData);
        this.subscriptions.push(
            this.pollForm.contentForm.valueChanges.pipe(debounceTime(150), distinctUntilChanged()).subscribe(() => {
                this.triggerUpdate();
            })
        );
    }

    protected getContentObjectsForOptions(): BaseModel[] {
        if (!this.pollData) {
            return [];
        }
        const contentObject = this.pollData.content_object as ViewAssignment;
        return contentObject.candidatesAsUsers;
    }

    protected getAnalogVoteFields(): VoteValue[] {
        const pollmethod = this.pollForm.contentForm.get('pollmethod').value;

        const analogPollValues: VoteValue[] = [];

        if (pollmethod === PollMethod.N) {
            analogPollValues.push('N');
        } else {
            analogPollValues.push('Y');

            if (pollmethod !== PollMethod.Y) {
                analogPollValues.push('N');
            }
            if (pollmethod === PollMethod.YNA) {
                analogPollValues.push('A');
            }
        }

        return analogPollValues;
    }
}
