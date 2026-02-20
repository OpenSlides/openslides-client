import { AfterViewInit, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { PollPercentBaseVerbose, VoteValue } from 'src/app/domain/models/poll';
import { BasePollDialogComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollApprovalFormComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-approval-form/poll-approval-form.component';
import { PollFormComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

import { MotionPollService } from '../../services';

@Component({
    selector: `os-motion-poll-dialog`,
    templateUrl: `./motion-poll-dialog.component.html`,
    imports: [PollFormComponent, PollApprovalFormComponent, MatDialogModule, MatButtonModule, TranslatePipe],
    styleUrls: [`./motion-poll-dialog.component.scss`]
})
export class MotionPollDialogComponent extends BasePollDialogComponent implements AfterViewInit {
    public PercentBaseVerbose = PollPercentBaseVerbose;
    public majority: string;

    public get isEVotingEnabled(): boolean {
        return this.motionPollService.isElectronicVotingEnabled;
    }

    public constructor(
        private motionPollService: MotionPollService,
        @Inject(MAT_DIALOG_DATA) pollData: ViewPoll<ViewMotion>
    ) {
        super(pollData);
    }

    public ngAfterViewInit(): void {
        /*
        this.dialogVoteForm.get(`options.${this.pollData.content_object?.fqid}`)?.valueChanges.subscribe(data => {
            let newMajority = data[this.majority] === -1 ? this.majority : ``;
            for (const option of Object.keys(data)) {
                if (data[option] === -1 && this.majority !== option) {
                    newMajority = option;
                }
            }

            if (this.majority !== newMajority) {
                for (const option of Object.keys(data)) {
                    if (data[option] === -1 && newMajority !== option) {
                        this.dialogVoteForm
                            .get(`options.${this.pollData.content_object?.fqid}.${option}`)
                            ?.setValue(``);
                    }
                }
            }

            this.majority = newMajority;
        });
        */
    }

    protected getAnalogVoteFields(): VoteValue[] {
        return [`Y`, `N`, `A`];
    }

    protected getContentObjectsForOptions(): BaseModel[] {
        return [this.pollData.content_object];
    }
}
