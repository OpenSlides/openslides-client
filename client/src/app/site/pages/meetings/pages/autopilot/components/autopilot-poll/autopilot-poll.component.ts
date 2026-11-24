import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { ProjectorButtonModule } from '@app/site/pages/meetings/modules/meetings-component-collector/projector-button/projector-button.module';
import { PollProgressComponent } from '@app/site/pages/meetings/modules/poll/components/poll-progress/poll-progress.component';
import { PollResultComponent } from '@app/site/pages/meetings/modules/poll/components/poll-result/poll-result.component';
import { PollVoteComponent } from '@app/site/pages/meetings/modules/poll/components/poll-vote/poll-vote.component';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { OperatorService } from '@app/site/services/operator.service';
import { DirectivesModule } from '@app/ui/directives';
import { TranslatePipe } from '@ngx-translate/core';

import { BaseMeetingComponent } from '../../../../base/base-meeting.component';

@Component({
    selector: 'os-autopilot-poll',
    imports: [
        PollVoteComponent,
        PollProgressComponent,
        PollResultComponent,
        ProjectorButtonModule,
        TranslatePipe,
        DirectivesModule,
        RouterLink,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule
    ],
    templateUrl: './autopilot-poll.component.html',
    styleUrl: './autopilot-poll.component.scss'
})
export class AutopilotPollComponent extends BaseMeetingComponent {
    public poll = input.required<ViewPoll>();

    public isSameMeeting = computed(() => {
        return this.poll().meeting_id === this.currentMeetingId();
    });

    public getDetailLink = computed(() => {
        if (this.poll().isMotionPoll) {
            return `/${this.poll().meeting_id}/motions/${this.poll().content_object.sequential_number}`;
        } else if (this.poll().isAssignmentPoll) {
            return `/${this.poll().meeting_id}/assignments/${this.poll().content_object.sequential_number}`;
        } else if (this.poll().isTopicPoll) {
            return `/${this.poll().meeting_id}/agenda/topics/${this.poll().content_object.sequential_number}`;
        }

        return null;
    });

    private operator = inject(OperatorService);

    public user = toSignal(this.operator.userObservable);
    public currentMeetingId = toSignal(this.activeMeetingIdService.meetingIdObservable);
    public voteDelegationEnabled = toSignal(this.meetingSettingsService.get(`users_enable_vote_delegations`));

    public delegations = computed(() => {
        return this.user().vote_delegations_from();
    });
}
