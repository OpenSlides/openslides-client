import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
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
import { PollEditResultComponent } from '@app/site/pages/meetings/modules/poll/components/poll-edit-result/poll-edit-result.component';
import { PollFormComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormApprovalComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-approval/poll-form-approval.component';
import { PollFormRatingApprovalComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-rating-approval/poll-form-rating-approval.component';
import { PollFormRatingScoreComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-rating-score/poll-form-rating-score.component';
import { PollFormSelectionComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-selection/poll-form-selection.component';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';
import { MeetingSettingsService } from '@app/site/pages/meetings/services/meeting-settings.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: `os-assignment-poll-dialog`,
    templateUrl: `./assignment-poll-dialog.component.html`,
    styleUrls: [`./assignment-poll-dialog.component.scss`],
    imports: [
        PollEditResultComponent,
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

    private tabMethodMap = computed(() => {
        const methods = [];
        if (!this.hasMultipleOptions) {
            methods.push(`approval`);
            if (this.allowCumulative()) {
                methods.push(`rating_score`);
            }
        } else {
            methods.push(`selection`, `rating_approval`);
            if (this.allowCumulative()) {
                methods.push(`rating_score`);
            }
            methods.push(`approval`);
        }

        return methods;
    });

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
        } else if (this.pollData?.config?.method) {
            this.method = this.pollData.config.method;
        }
        this.selectedTab.set(this.tabMethodMap().indexOf(this.method));

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

    public analogPollOptions(): { key: string; title: string }[] {
        const assignment = this.pollData?.content_object as ViewAssignment;

        const options = [];
        if (this.getSelectedMethod() === `approval`) {
            options.push([{ key: `approval`, title: null }]);
        } else {
            for (const option of assignment.candidates) {
                options.push({ key: `meeting_user-${option.meeting_user_id}`, title: option.getTitle() });
            }
        }

        return options;
    }

    public getMethodConfig(): unknown {
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

    public getSelectedMethod(): string {
        return this.tabMethodMap()[this.selectedTab()];
    }
}
