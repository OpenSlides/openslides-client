import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, viewChild } from '@angular/core';
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
import { ActiveMeetingService } from '@app/site/pages/meetings/services/active-meeting.service';
import { ViewMeetingPollSetting } from '@app/site/pages/meetings/view-models/view-meeting-poll-setting';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, switchMap } from 'rxjs';

@Component({
    selector: `os-motion-poll-dialog`,
    templateUrl: `./motion-poll-dialog.component.html`,
    imports: [
        PollEditResultComponent,
        PollFormComponent,
        PollFormApprovalComponent,
        MatDialogModule,
        MatButtonModule,
        TranslatePipe,
        AsyncPipe
    ],
    styleUrls: [`./motion-poll-dialog.component.scss`]
})
export class MotionPollDialogComponent extends BasePollDialogComponent {
    private approvalForm = viewChild.required(PollFormApprovalComponent);

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    public approvalFormValid = computed(() => {
        return this.approvalForm().formValid();
    });

    public get approvalFormValue(): Partial<PollConfigApproval> {
        return this.approvalForm().form.value;
    }

    public get pollSettings(): Observable<ViewMeetingPollSetting> {
        return this.activeMeetingService.meetingObservable.pipe(switchMap(m => m.motion_poll_config$));
    }

    private pollService = inject(PollService);
    private activeMeetingService = inject(ActiveMeetingService);

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
        const options = [{ key: `approval`, title: null }];

        return options;
    }
}
