import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Id } from 'src/app/domain/definitions/key-types';
import { Permission } from 'src/app/domain/definitions/permission';
import { BasePollComponent } from 'src/app/site/pages/meetings/modules/poll/base/base-poll.component';
import { PollComponent } from 'src/app/site/pages/meetings/modules/poll/components/poll/poll.component';
import { OperatorService } from 'src/app/site/services/operator.service';
import { DirectivesModule } from 'src/app/ui/directives';

@Component({
    selector: `os-assignment-poll`,
    templateUrl: `./assignment-poll.component.html`,
    styleUrls: [`./assignment-poll.component.scss`],
    imports: [PollComponent, DirectivesModule, MatCardModule, MatMenuModule, MatIconModule, MatDividerModule]
})
export class AssignmentPollComponent extends BasePollComponent {
    // TODO: Use signals
    @Input()
    public set pollId(id: Id) {
        this.initializePoll(id);
    }

    @Output()
    public readonly dialogOpened = new EventEmitter<void>();

    public get showPoll(): boolean {
        if (this.poll) {
            if (
                this.operator.hasPerms(Permission.assignmentCanManagePolls) ||
                this.poll.isPublished ||
                (this.poll.isEVoting && !this.poll.isCreated)
            ) {
                return true;
            }
        }
        return false;
    }

    private operator = inject(OperatorService);

    // TODO: Maybe remove
    public getDetailLink(): string {
        return `/${this.poll.meeting_id}/assignments/polls/${this.poll.sequential_number}`;
    }
}
