import { Component, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { TranslatePipe } from '@ngx-translate/core';
import { PollVisibility } from 'src/app/domain/models/poll';
import { PollUpdatePayload } from 'src/app/gateways/vote-api.service';
import { BasePollDialogComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollFormComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormApprovalComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-approval/poll-form-approval.component';
import { PollFormRatingApprovalComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-rating-approval/poll-form-rating-approval.component';
import { PollFormSelectionComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-selection/poll-form-selection.component';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';

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
    private approvalForm = viewChild(PollFormApprovalComponent);
    private selectionForm = viewChild(PollFormSelectionComponent);
    private ratingApprovalForm = viewChild(PollFormRatingApprovalComponent);

    public method = `rating_approval`;

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    public selectedTab = signal(0);

    private pollService = inject(PollService);

    public override submitPoll(): void {
        const formValues = this.pollForm().getValues();
        const visibility: PollVisibility = formValues?.visibility;

        const assignment = this.pollData?.content_object as ViewAssignment;
        const options = assignment.candidates.map(c => c.meeting_user_id);

        const payload: PollUpdatePayload = {
            title: formValues?.title,
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

        this.dialogRef.close(payload);
    }

    private getMethodConfig(): unknown {
        switch (TAB_METHOD_MAP[this.selectedTab()]) {
            case `approval`:
                return { ...this.approvalForm()?.approvalForm.value };
            case `selection`:
                return { ...this.selectionForm()?.form.value };
            case `rating_approval`:
                return { ...this.ratingApprovalForm()?.form.value };
        }
        return {};
    }
}
