import { Component, effect, inject, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { BasePollComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll.component';
import { PollComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll/poll.component';
import { OperatorService } from 'src/app/site/services/operator.service';

import { ViewTopic } from '../../../../view-models';

@Component({
    selector: `os-topic-poll`,
    templateUrl: `./topic-poll.component.html`,
    styleUrls: [`./topic-poll.component.scss`],
    imports: [PollComponent, MatCardModule]
})
export class TopicPollComponent extends BasePollComponent<ViewTopic> {
    public pollId = input.required<Id>();

    public dialogOpened = output();

    public get shouldShowPoll(): boolean {
        if (this.poll) {
            if (
                this.operator.hasPerms(Permission.agendaItemCanSeePolls) ||
                this.poll.isPublished ||
                (this.poll.isEVoting && !this.poll.isCreated)
            ) {
                return true;
            }
        }
        return false;
    }

    private operator = inject(OperatorService);

    public constructor() {
        super();

        effect(() => {
            this.initializePoll(this.pollId());
        });
    }

    public getDetailLink(): string {
        return `/${this.poll.meeting_id}/topics/polls/${this.poll.sequential_number}`;
    }
}
