import { Component, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { PollConfigApproval } from '@app/domain/models/poll/poll-config-approval';
import {
    BasePollDialogComponent,
    PollMethodPayload,
    PollOptionsPayload
} from '@app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollEditResultComponent } from '@app/site/pages/meetings/modules/poll/components/poll-edit-result/poll-edit-result.component';
import { PollFormComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormApprovalComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form-approval/poll-form-approval.component';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
    selector: `os-motion-poll-dialog`,
    templateUrl: `./motion-poll-dialog.component.html`,
    imports: [
        PollEditResultComponent,
        PollFormComponent,
        PollFormApprovalComponent,
        MatDialogModule,
        MatButtonModule,
        TranslatePipe
    ],
    styleUrls: [`./motion-poll-dialog.component.scss`]
})
export class MotionPollDialogComponent extends BasePollDialogComponent {
    private approvalForm = viewChild.required(PollFormApprovalComponent);

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    public override get formsValid(): boolean {
        if (!super.formsValid) {
            return false;
        }

        return this.approvalForm().form.valid;
    }

    public get approvalFormValue(): Partial<PollConfigApproval> {
        return this.approvalForm().form.value;
    }

    private pollService = inject(PollService);
    private translate = inject(TranslateService);

    public override methodPayload(): PollMethodPayload {
        const config = { ...this.approvalFormValue };
        return {
            method: `approval`,
            method_config: config
        };
    }

    public override optionsPayload(): PollOptionsPayload {
        return {};
    }

    public analogPollOptions(): { key: string; title: string }[] {
        const options = [
            { key: `yes`, title: this.translate.instant(`Yes`) },
            { key: `no`, title: this.translate.instant(`No`) }
        ];

        if (this.approvalFormValue.allow_abstain) {
            options.push({ key: `abstain`, title: this.translate.instant(`Abstain`) });
        }

        return options;
    }
}
