import { Component, computed, inject, input, output } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Id } from '@app/domain/definitions/key-types';
import { Permission } from '@app/domain/definitions/permission';
import { BaseMeetingComponent } from '@app/site/pages/meetings/base/base-meeting.component';
import { PollComponent } from '@app/site/pages/meetings/modules/poll/components/poll/poll.component';
import { PollControllerService } from '@app/site/pages/meetings/modules/poll/services/poll-controller.service';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { OperatorService } from '@app/site/services/operator.service';
import { DirectivesModule } from '@app/ui/directives';

@Component({
    selector: `os-assignment-poll`,
    templateUrl: `./assignment-poll.component.html`,
    styleUrls: [`./assignment-poll.component.scss`],
    imports: [PollComponent, DirectivesModule, MatCardModule, MatMenuModule, MatIconModule, MatDividerModule]
})
export class AssignmentPollComponent extends BaseMeetingComponent {
    public pollId = input.required<Id>();

    public dialogOpened = output();

    private operator = inject(OperatorService);
    protected repo = inject(PollControllerService);

    public poll = rxResource<ViewPoll, Id>({
        params: () => this.pollId(),
        stream: ({ params }) => this.repo.getViewModelObservable(params)
    });

    public showPoll = computed<boolean>(() => {
        if (this.poll.hasValue()) {
            const poll = this.poll.value();
            if (
                this.operator.hasPerms(Permission.assignmentCanSeePolls) ||
                poll.isPublished ||
                (poll.isEVoting && !poll.isCreated)
            ) {
                return true;
            }
        }
        return false;
    });
}
