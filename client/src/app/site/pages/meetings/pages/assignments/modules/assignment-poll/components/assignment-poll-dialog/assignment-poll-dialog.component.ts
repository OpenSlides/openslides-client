import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { AssignmentRepositoryService } from '@app/gateways/repositories/assignments/assignment-repository.service';
import { idFromFqid } from '@app/infrastructure/utils/transform-functions';
import {
    BasePollDialogComponent,
    PollMethodPayload,
    PollOptionsPayload
} from '@app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollEditResultComponent } from '@app/site/pages/meetings/modules/poll/components/poll-edit-result/poll-edit-result.component';
import { PollFormComponent } from '@app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { ViewAssignment } from '@app/site/pages/meetings/pages/assignments';
import { ActiveMeetingService } from '@app/site/pages/meetings/services/active-meeting.service';
import { TranslatePipe } from '@ngx-translate/core';
import { map, switchMap } from 'rxjs';

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
        TranslatePipe
    ]
})
export class AssignmentPollDialogComponent extends BasePollDialogComponent {
    private repo = inject(AssignmentRepositoryService);
    private activeMeetingService = inject(ActiveMeetingService);

    public optionAmount = this.pollData?.content_object_id
        ? toSignal(
              this.repo.getViewModelObservable(idFromFqid(this.pollData.content_object_id)).pipe(
                  switchMap(a => a.candidates$),
                  map(c => c?.length)
              )
          )
        : signal(0);

    public pollSettings = toSignal(
        this.activeMeetingService.meetingObservable.pipe(switchMap(m => m.assignment_poll_config$))
    );

    public analogPollOptions = computed<{ key: string; title: string }[]>(() => {
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
    });

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
}
