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
import { TranslatePipe } from '@ngx-translate/core';

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

    private pollService = inject(PollService);

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
                options.push({ key: `meeting_user-${option.meeting_user_id}`, title: option.getTitle() });
            }
        }

        return options;
    }
}
