import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Id } from '@app/domain/definitions/key-types';
import { Permission } from '@app/domain/definitions/permission';
import { BasePollComponent } from '@app/site/pages/meetings/modules/poll/base/base-poll.component';
import { PollComponent } from '@app/site/pages/meetings/modules/poll/components/poll/poll.component';
import { OperatorService } from '@app/site/services/operator.service';
import { DirectivesModule } from '@app/ui/directives';

@Component({
    selector: `os-assignment-poll`,
    templateUrl: `./assignment-poll.component.html`,
    styleUrls: [`./assignment-poll.component.scss`],
    imports: [PollComponent, DirectivesModule, MatCardModule, MatMenuModule, MatIconModule, MatDividerModule],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class AssignmentPollComponent extends BasePollComponent {
    public pollId = input.required<Id>();

    public dialogOpened = output();

    public get showPoll(): boolean {
        if (this.poll) {
            if (
                this.operator.hasPerms(Permission.assignmentCanSeePolls) ||
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
        return `/${this.poll.meeting_id}/assignments/polls/${this.poll.sequential_number}`;
    }
}
