import { Component, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseModel } from 'src/app/domain/models/base/base-model';
import { PollPercentBaseVerbose, PollVisibility, VoteValue } from 'src/app/domain/models/poll';
import { PollCreatePayload, VoteApiService } from 'src/app/gateways/vote-api.service';
import { BasePollDialogComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll-dialog.component';
import { PollFormComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form/poll-form.component';
import { PollFormSelectionComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll-form-selection/poll-form-selection.component';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';

import { ViewTopic } from '../../../../view-models';
import { TopicPollService } from '../../services/topic-poll.service';

@Component({
    selector: `os-topic-poll-dialog`,
    templateUrl: `./topic-poll-dialog.component.html`,
    styleUrls: [`./topic-poll-dialog.component.scss`],
    imports: [PollFormComponent, PollFormSelectionComponent, MatDialogModule, MatButtonModule, TranslatePipe]
})
export class TopicPollDialogComponent extends BasePollDialogComponent {
    public PercentBaseVerbose = PollPercentBaseVerbose;
    public majority: string;

    @ViewChild(PollFormSelectionComponent)
    private selectionPollForm: PollFormSelectionComponent | null = null;

    public get isEVotingEnabled(): boolean {
        return this.topicPollService.isElectronicVotingEnabled;
    }

    public constructor(
        private voteApiService: VoteApiService,
        private topicPollService: TopicPollService,
        @Inject(MAT_DIALOG_DATA) pollData: ViewPoll<ViewTopic>
    ) {
        super(pollData);
    }

    public override submitPoll(): void {
        const formValues = this.pollForm?.getValues();
        const config = { ...this.selectionPollForm?.form.value };
        const topic = this.pollData?.content_object;
        const visibility: PollVisibility = formValues?.visibility;

        const payload: PollCreatePayload = {
            title: formValues?.title,
            content_object_id: topic?.fqid,
            meeting_id: topic?.meeting_id,
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

        if (this.pollData?.id) {
            delete payload[`meeting_id`];
            delete payload[`content_object_id`];
            this.voteApiService.update(this.pollData.id, payload);
        } else {
            this.voteApiService.create(payload);
        }

        this.dialogRef.close();
    }

    protected getAnalogVoteFields(): VoteValue[] {
        return [`Y`, `N`, `A`];
    }

    protected getContentObjectsForOptions(): BaseModel[] {
        return [this.pollData.content_object];
    }
}
