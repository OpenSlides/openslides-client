import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { collectionFromFqid } from '@app/infrastructure/utils/transform-functions';
import {
    BasePollDialogComponent,
    PollMethodPayload,
    PollOptionsPayload
} from '@app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollFormComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormApprovalComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-approval/poll-form-approval.component';
import { PollFormRatingApprovalComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-rating-approval/poll-form-rating-approval.component';
import { PollFormRatingScoreComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-rating-score/poll-form-rating-score.component';
import { PollFormSelectionComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-selection/poll-form-selection.component';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';
import { MeetingSettingsService } from '@app/site/pages/meetings/services/meeting-settings.service';
import { TranslatePipe } from '@ngx-translate/core';

const TAB_METHOD_MAP = [`selection`, `rating_approval`, `rating_score`, `approval`];

@Component({
    selector: `os-assignment-poll-dialog`,
    templateUrl: `./assignment-poll-dialog.component.html`,
    styleUrls: [`./assignment-poll-dialog.component.scss`],
    imports: [
        PollFormComponent,
        PollFormApprovalComponent,
        PollFormSelectionComponent,
        PollFormRatingApprovalComponent,
        PollFormRatingScoreComponent,
        MatDialogModule,
        MatButtonModule,
        MatTabsModule,
        TranslatePipe
    ],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class AssignmentPollDialogComponent extends BasePollDialogComponent {
    private approvalForm = viewChild(PollFormApprovalComponent);
    private selectionForm = viewChild(PollFormSelectionComponent);
    private ratingApprovalForm = viewChild(PollFormRatingApprovalComponent);
    private ratingScoreForm = viewChild(PollFormRatingScoreComponent);

    public method = `rating_approval`;

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    public override get formsValid(): boolean {
        if (!super.formsValid) {
            return false;
        }

        switch (this.getSelectedMethod()) {
            case `approval`:
                return this.approvalForm()?.form.valid;
            case `selection`:
                return this.selectionForm()?.form.valid;
            case `rating_approval`:
                return this.ratingApprovalForm()?.form.valid;
            case `rating_score`:
                return this.ratingScoreForm()?.form.valid;
        }

        return false;
    }

    public get hasMultipleOptions(): boolean {
        const assignment = this.pollData?.content_object as ViewAssignment;
        return assignment.candidates.length > 1;
    }

    public get optionAmount(): number {
        const assignment = this.pollData?.content_object as ViewAssignment;

        return assignment.candidates.length;
    }

    public selectedTab = signal(0);
    public allowCumulative = signal(false);

    private pollService = inject(PollService);
    private meetingSettingsService = inject(MeetingSettingsService);

    public constructor() {
        super();

        if (this.pollData?.config_id) {
            const collection = collectionFromFqid(this.pollData?.config_id);
            this.method = collection.replace(`poll_config_`, ``);
            this.selectedTab.set(TAB_METHOD_MAP.indexOf(this.method));
        }

        if (!this.pollData?.config_id && this.pollData?.config?.method) {
            this.method = this.pollData.config.method;
            this.selectedTab.set(TAB_METHOD_MAP.indexOf(this.method));
        }

        this.meetingSettingsService
            .get(`poll_enable_max_votes_per_option`)
            .pipe(takeUntilDestroyed())
            .subscribe(v => {
                this.allowCumulative.set(v);
            });
    }

    public override methodPayload(): PollMethodPayload {
        return {
            method: this.getSelectedMethod(),
            method_config: this.getMethodConfig()
        };
    }

    public override optionsPayload(): PollOptionsPayload {
        const assignment = this.pollData?.content_object as ViewAssignment;
        const options = assignment.candidates.map(c => c.meeting_user_id);
        return {
            option_type: `meeting_user`,
            options
        };
    }

    private getSelectedMethod(): string {
        if (!this.hasMultipleOptions) {
            if (this.selectedTab() != 1) {
                return `approval`;
            }

            return `rating_score`;
        }

        return TAB_METHOD_MAP[this.selectedTab()];
    }

    private getMethodConfig(): unknown {
        switch (this.getSelectedMethod()) {
            case `approval`:
                return { ...this.approvalForm()?.getSerialzedForm() };
            case `selection`:
                return { ...this.selectionForm()?.getSerialzedForm() };
            case `rating_approval`:
                return { ...this.ratingApprovalForm()?.getSerialzedForm() };
            case `rating_score`:
                return { ...this.ratingScoreForm()?.getSerialzedForm() };
        }
        return {};
    }
}
