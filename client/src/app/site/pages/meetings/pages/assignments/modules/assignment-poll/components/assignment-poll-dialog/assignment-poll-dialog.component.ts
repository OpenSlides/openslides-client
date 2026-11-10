import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import {
    BasePollDialogComponent,
    PollMethodPayload,
    PollOptionsPayload
} from '@app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollEditResultComponent } from '@app/site/pages/meetings/modules/poll/components/poll-edit-result/poll-edit-result.component';
import { PollFormComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollService } from '@app/site/pages/meetings/modules/poll/services/poll.service';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';
import { ActiveMeetingService } from '@app/site/pages/meetings/services/active-meeting.service';
import { ViewMeetingPollSetting } from '@app/site/pages/meetings/view-models/view-meeting-poll-setting';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, switchMap } from 'rxjs';

@Component({
    selector: `os-assignment-poll-dialog`,
    templateUrl: `./assignment-poll-dialog.component.html`,
    styleUrls: [`./assignment-poll-dialog.component.scss`],
    imports: [
        PollEditResultComponent,
        PollFormComponent,
        MatDialogModule,
        MatButtonModule,
        MatTabsModule,
        TranslatePipe,
        AsyncPipe
    ],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class AssignmentPollDialogComponent extends BasePollDialogComponent {
    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    public get hasMultipleOptions(): boolean {
        const assignment = this.pollData?.content_object as ViewAssignment;
        return assignment.candidates.length > 1;
    }

    public get optionAmount(): number {
        const assignment = this.pollData?.content_object as ViewAssignment;
        return assignment.candidates.length;
    }

    public get pollSettings(): Observable<ViewMeetingPollSetting> {
        return this.activeMeetingService.meetingObservable.pipe(switchMap(m => m.assignment_poll_config$));
    }

    private pollService = inject(PollService);
    private activeMeetingService = inject(ActiveMeetingService);

    public override methodPayload(): PollMethodPayload {
        return {
            method: this.pollForm().selectedMethod(),
            method_config: this.pollForm().methodConfig()
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
        if (this.pollForm().selectedMethod() === `approval`) {
            options.push([{ key: `approval`, title: null }]);
        } else {
            for (const option of assignment.candidates) {
                options.push({ key: `meeting_user/${option.meeting_user_id}`, title: option.getTitle() });
            }
        }

        return options;
    }
}
