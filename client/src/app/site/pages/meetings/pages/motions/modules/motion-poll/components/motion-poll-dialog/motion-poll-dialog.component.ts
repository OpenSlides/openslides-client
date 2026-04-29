import { Component, Inject, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { PollVisibility, VoteValue } from 'src/app/domain/models/poll';
import { PollUpdatePayload } from 'src/app/gateways/vote-api.service';
import { BasePollDialogComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollFormComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormApprovalComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-approval/poll-form-approval.component';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { ViewMotion } from 'src/app/site/pages/meetings/pages/motions';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

@Component({
    selector: `os-motion-poll-dialog`,
    templateUrl: `./motion-poll-dialog.component.html`,
    imports: [PollFormComponent, PollFormApprovalComponent, MatDialogModule, MatButtonModule, TranslatePipe],
    styleUrls: [`./motion-poll-dialog.component.scss`]
})
export class MotionPollDialogComponent extends BasePollDialogComponent {
    public majority: string;

    @ViewChild(PollFormApprovalComponent)
    private approvalForm: PollFormApprovalComponent | null = null;

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    private pollService = inject(PollService);

    public constructor(@Inject(MAT_DIALOG_DATA) pollData: ViewPoll<ViewMotion>) {
        super(pollData);
    }

    public override submitPoll(): void {
        const formValues = this.pollForm?.getValues();
        const config = { ...this.approvalForm?.approvalForm.value };
        const visibility: PollVisibility = formValues?.visibility;

        const payload: PollUpdatePayload = {
            title: formValues?.title,
            method: `approval`,
            method_config: config,
            visibility,
            allow_vote_split: false
        };

        if (visibility !== PollVisibility.Manually) {
            payload.entitled_group_ids = formValues?.entitled_group_ids ?? [];
            payload.live_voting_enabled = formValues?.live_voting_enabled ?? false;
        }

        this.dialogRef.close(payload);
    }

    protected getAnalogVoteFields(): VoteValue[] {
        return [`Y`, `N`, `A`];
    }

    protected getContentObjectsForOptions(): BaseModel[] {
        return [this.pollData.content_object];
    }
}
