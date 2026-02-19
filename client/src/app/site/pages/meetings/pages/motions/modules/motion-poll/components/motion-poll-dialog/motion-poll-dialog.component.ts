import { AfterViewInit, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { _ } from '@ngx-translate/core';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { PollPercentBaseVerbose, VoteValue } from 'src/app/domain/models/poll';
import { BasePollDialogComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

import { MotionPollService } from '../../services';

export const MotionPollMethodsVerbose = {
    YN: _(`Yes/No`),
    YNA: _(`Yes/No/Abstain`)
};

@Component({
    selector: `os-motion-poll-dialog`,
    templateUrl: `./motion-poll-dialog.component.html`,
    styleUrls: [`./motion-poll-dialog.component.scss`],
    standalone: false
})
export class MotionPollDialogComponent extends BasePollDialogComponent implements AfterViewInit {
    public PercentBaseVerbose = PollPercentBaseVerbose;
    public majority: string;

    public MotionPollMethodsVerbose = MotionPollMethodsVerbose;

    public constructor(
        public motionPollService: MotionPollService,
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
