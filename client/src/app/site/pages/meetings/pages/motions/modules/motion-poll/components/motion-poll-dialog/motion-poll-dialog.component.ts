import { Component, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { PollPercentBaseVerbose, PollVisibility, VoteValue } from 'src/app/domain/models/poll';
import { PollCreatePayload, VoteApiService } from 'src/app/gateways/vote-api.service';
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
export class MotionPollDialogComponent extends BasePollDialogComponent {
    public PercentBaseVerbose = PollPercentBaseVerbose;
    public majority: string;

    @ViewChild(PollApprovalFormComponent)
    private approvalForm: PollApprovalFormComponent | null = null;

    public get isEVotingEnabled(): boolean {
        return this.motionPollService.isElectronicVotingEnabled;
    }

    public constructor(
        private voteApiService: VoteApiService,
        private motionPollService: MotionPollService,
        @Inject(MAT_DIALOG_DATA) pollData: ViewPoll<ViewMotion>
    ) {
        super(pollData);

        console.log(this.motionPollService.defaultGroupIds);
        console.log(this.motionPollService.defaultPollVisibility);
        console.log(this.motionPollService.defaultPollVisibility);
    }

    public override submitPoll(): void {
        const formValues = this.pollForm?.getValues();
        const config = { ...this.approvalForm?.approvalForm.value };
        const motion = this.pollData?.content_object;
        const visibility: PollVisibility = formValues?.visibility;

        const payload: PollCreatePayload = {
            title: formValues?.title,
            content_object_id: motion?.fqid,
            meeting_id: motion?.meeting_id,
            method: `approval`,
            config,
            visibility,
            allow_vote_split: false
        };

        if (visibility !== PollVisibility.Manually) {
            payload.entitled_group_ids = formValues?.entitled_group_ids ?? [];
            payload.live_voting_enabled = formValues?.live_voting_enabled ?? false;
        }

        this.voteApiService.create(payload);
    }

    protected getAnalogVoteFields(): VoteValue[] {
        return [`Y`, `N`, `A`];
    }

    protected getContentObjectsForOptions(): BaseModel[] {
        return [this.pollData.content_object];
    }
}
