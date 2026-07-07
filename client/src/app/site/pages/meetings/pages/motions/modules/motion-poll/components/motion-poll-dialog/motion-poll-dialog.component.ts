import { ChangeDetectionStrategy, Component, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { PollConfigApproval } from 'src/app/domain/models/poll/poll-config-approval';
import {
    BasePollDialogComponent,
    PollMethodPayload,
    PollOptionsPayload
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollEditResultComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-edit-result/poll-edit-result.component';
import { PollFormComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormApprovalComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-approval/poll-form-approval.component';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';

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
    styleUrls: [`./motion-poll-dialog.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
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

        return this.approvalForm().approvalForm.valid;
    }

    public get approvalFormValue(): Partial<PollConfigApproval> {
        return this.approvalForm().approvalForm.value;
    }

    private pollService = inject(PollService);

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
}
