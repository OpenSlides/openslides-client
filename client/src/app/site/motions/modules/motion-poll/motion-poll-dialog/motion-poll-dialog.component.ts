import { Component, Inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { PollDialogData } from 'app/core/ui-services/base-poll-dialog.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { BaseModel } from 'app/shared/models/base/base-model';
import { VoteValue } from 'app/shared/models/poll/poll-constants';
import { PollPercentBaseVerbose } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewMotion } from 'app/site/motions/models/view-motion';
import { MotionPollService } from 'app/site/motions/services/motion-poll.service';
import { BasePollDialogComponent } from 'app/site/polls/components/base-poll-dialog.component';

@Component({
    selector: `os-motion-poll-dialog`,
    templateUrl: `./motion-poll-dialog.component.html`,
    styleUrls: [`./motion-poll-dialog.component.scss`]
})
export class MotionPollDialogComponent extends BasePollDialogComponent {
    public PercentBaseVerbose = PollPercentBaseVerbose;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        public motionPollService: MotionPollService,
        public dialogRef: MatDialogRef<BasePollDialogComponent>,
        formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public pollData: PollDialogData | ViewPoll<ViewMotion>
    ) {
        super(componentServiceCollector, translate, dialogRef, pollData, formBuilder);
    }

    protected getAnalogVoteFields(): VoteValue[] {
        return [`Y`, `N`, `A`];
    }

    protected getContentObjectsForOptions(): BaseModel[] {
        return [this.pollData.content_object];
    }
}
