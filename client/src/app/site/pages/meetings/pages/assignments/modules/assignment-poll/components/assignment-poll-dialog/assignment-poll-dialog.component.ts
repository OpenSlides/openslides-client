import { Component, Inject, signal, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { PollVisibility, VoteValue } from 'src/app/domain/models/poll';
import { PollCreatePayload, VoteApiService } from 'src/app/gateways/vote-api.service';
import { BasePollDialogComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollFormComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormApprovalComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-approval/poll-form-approval.component';
import { PollFormRatingApprovalComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-rating-approval/poll-form-rating-approval.component';
import { PollFormSelectionComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-selection/poll-form-selection.component';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

import { AssignmentPollService } from '../../services/assignment-poll.service';

const TAB_METHOD_MAP = [`selection`, `rating_approval`, `approval`];

@Component({
    selector: `os-assignment-poll-dialog`,
    templateUrl: `./assignment-poll-dialog.component.html`,
    styleUrls: [`./assignment-poll-dialog.component.scss`],
    imports: [
        PollFormComponent,
        PollFormApprovalComponent,
        PollFormSelectionComponent,
        PollFormRatingApprovalComponent,
        MatDialogModule,
        MatButtonModule,
        MatTabsModule,
        TranslatePipe
    ]
})
export class AssignmentPollDialogComponent extends BasePollDialogComponent {
    @ViewChild(PollFormApprovalComponent)
    private approvalForm: PollFormApprovalComponent | null = null;

    @ViewChild(PollFormSelectionComponent)
    private selectionForm: PollFormSelectionComponent | null = null;

    @ViewChild(PollFormRatingApprovalComponent)
    private ratingApprovalForm: PollFormRatingApprovalComponent | null = null;

    public method = `rating_approval`;

    public get isEVotingEnabled(): boolean {
        return this.assignmentPollService.isElectronicVotingEnabled;
    }

    public selectedTab = signal(0);

    public constructor(
        private voteApiService: VoteApiService,
        private assignmentPollService: AssignmentPollService,
        @Inject(MAT_DIALOG_DATA) pollData: ViewPoll<ViewAssignment>
    ) {
        super(pollData);
    }

    public override submitPoll(): void {
        const formValues = this.pollForm?.getValues();
        const visibility: PollVisibility = formValues?.visibility;

        const assignment = this.pollData?.content_object as ViewAssignment;
        const options = assignment.candidates.map(c => c.meeting_user_id);

        const payload: PollCreatePayload = {
            title: formValues?.title,
            content_object_id: assignment?.fqid,
            meeting_id: assignment?.meeting_id,
            method: TAB_METHOD_MAP[this.selectedTab()],
            method_config: this.getMethodConfig(),
            option_type: `meeting_user`,
            options,
            visibility,
            allow_vote_split: false
        };

        if (visibility !== PollVisibility.Manually) {
            payload.entitled_group_ids = formValues?.entitled_group_ids ?? [];
            payload.live_voting_enabled = formValues?.live_voting_enabled ?? false;
        }

        if (this.pollData?.id) {
            delete payload[`meeting_id`];
            delete payload[`content_object_id`];
            this.voteApiService.update(this.pollData.id, payload);
        } else {
            this.voteApiService.create(payload);
        }

        this.dialogRef.close();
    }

    protected getAnalogVoteFields(): VoteValue[] {
        return [`Y`, `N`, `A`];
    }

    protected getContentObjectsForOptions(): BaseModel[] {
        return [this.pollData.content_object];
    }

    private getMethodConfig(): unknown {
        switch (TAB_METHOD_MAP[this.selectedTab()]) {
            case `approval`:
                return { ...this.approvalForm?.approvalForm.value };
            case `selection`:
                return { ...this.selectionForm?.form.value };
            case `rating_approval`:
                return { ...this.ratingApprovalForm?.form.value };
        }
        return {};
    }
}
