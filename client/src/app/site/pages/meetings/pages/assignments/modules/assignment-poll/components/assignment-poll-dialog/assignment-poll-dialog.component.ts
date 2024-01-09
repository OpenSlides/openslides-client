import { Component, Inject } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import {
    GeneralValueVerbose,
    GlobalOptionKey,
    PollMethod,
    PollPercentBaseVerbose,
    PollPropertyVerbose,
    VoteValue
} from 'src/app/domain/models/poll';
import {
    BasePollDialogComponent,
    OptionsObject
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

import { AssignmentPollMethodVerbose, AssignmentPollPercentBaseVerbose } from '../../definitions';
import { AssignmentPollService, UnknownUserLabel } from '../../services/assignment-poll.service';

@Component({
    selector: `os-assignment-poll-dialog`,
    templateUrl: `./assignment-poll-dialog.component.html`,
    styleUrls: [`./assignment-poll-dialog.component.scss`]
})
export class AssignmentPollDialogComponent extends BasePollDialogComponent {
    public unknownUserLabel = UnknownUserLabel;

    /**
     * List of accepted special non-numerical values.
     * See {@link PollService.specialPollVotes}
     */
    public specialValues: [number, string][] = [];

    public generalValueVerbose = GeneralValueVerbose;
    public PollPropertyVerbose = PollPropertyVerbose;

    public AssignmentPollMethodVerbose = AssignmentPollMethodVerbose;
    public get AssignmentPollPercentBaseVerbose(): { [key: string]: string } {
        return this.pollData.isListPoll ? PollPercentBaseVerbose : AssignmentPollPercentBaseVerbose;
    }

    public readonly globalValues: GlobalOptionKey[] = [`global_yes`, `global_no`, `global_abstain`];

    /**
     * Constructor. Retrieves necessary metadata from the pollService,
     * injects the poll itself
     */
    public constructor(
        public readonly assignmentPollService: AssignmentPollService,
        @Inject(MAT_DIALOG_DATA) pollData: ViewPoll
    ) {
        super(pollData);
    }

    public override onBeforeInit(): void {
        this.subscriptions.push(
            this.pollForm!.contentForm.valueChanges.pipe(debounceTime(150), distinctUntilChanged()).subscribe(() => {
                this.triggerUpdate();
            })
        );
    }

    public getOptionAmount(): number {
        return this._options?.length;
    }

    public optionIsList(option: OptionsObject): boolean {
        return !!option.poll_candidate_user_ids?.length;
    }

    protected getContentObjectsForOptions(): BaseModel[] {
        if (!this.pollData) {
            return [];
        }
        const contentObject = this.pollData.content_object as ViewAssignment;
        return contentObject.candidatesAsUsers;
    }

    protected getAnalogVoteFields(): VoteValue[] {
        const pollmethod = this.pollForm!.contentForm.get(`pollmethod`)!.value;

        const analogPollValues: VoteValue[] = [];

        if (pollmethod === PollMethod.N) {
            analogPollValues.push(`N`);
        } else {
            analogPollValues.push(`Y`);

            if (pollmethod !== PollMethod.Y) {
                analogPollValues.push(`N`);
            }
            if ((pollmethod as string).toUpperCase() === PollMethod.YNA) {
                analogPollValues.push(`A`);
            }
        }

        return analogPollValues;
    }
}
