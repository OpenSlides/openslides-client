import { Component, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { PollVisibility } from 'src/app/domain/models/poll';
import { PollUpdatePayload } from 'src/app/gateways/vote-api.service';
import { BasePollDialogComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollFormComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormSelectionComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-selection/poll-form-selection.component';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';

@Component({
    selector: `os-topic-poll-dialog`,
    templateUrl: `./topic-poll-dialog.component.html`,
    styleUrls: [`./topic-poll-dialog.component.scss`],
    imports: [PollFormComponent, PollFormSelectionComponent, MatDialogModule, MatButtonModule, TranslatePipe]
})
export class TopicPollDialogComponent extends BasePollDialogComponent {
    public majority: string;

    private selectionPollForm = viewChild.required(PollFormSelectionComponent);

    public get isEVotingEnabled(): boolean {
        return this.pollService.isElectronicVotingEnabled;
    }

    private pollService = inject(PollService);

    public override submitPoll(): void {
        const formValues = this.pollForm().getValues();
        const config = { ...this.selectionPollForm().form.value };
        const visibility: PollVisibility = formValues?.visibility;

        const payload: PollUpdatePayload = {
            title: formValues?.title,
            method: `selection`,
            method_config: config,
            options: formValues.options,
            option_type: `text`,
            visibility,
            allow_vote_split: false
        };

        if (visibility !== PollVisibility.Manually) {
            payload.entitled_group_ids = formValues?.entitled_group_ids ?? [];
            payload.live_voting_enabled = formValues?.live_voting_enabled ?? false;
        }

        this.dialogRef.close(payload);
    }
}
