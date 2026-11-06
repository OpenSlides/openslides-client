import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Permission } from '@app/domain/definitions/permission';
import { BaseMeetingComponent } from '@app/site/pages/meetings/base/base-meeting.component';
import { ProjectorButtonModule } from '@app/site/pages/meetings/modules/meetings-component-collector/projector-button/projector-button.module';
import { PollComponent } from '@app/site/pages/meetings/modules/poll/components/poll/poll.component';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { OperatorService } from '@app/site/services/operator.service';
import { DirectivesModule } from '@app/ui/directives';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: `os-motion-poll`,
    imports: [
        PollComponent,
        RouterModule,
        TranslatePipe,
        DirectivesModule,
        MatButtonModule,
        MatCardModule,
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        MatDividerModule,
        ProjectorButtonModule
    ],
    templateUrl: `./motion-poll.component.html`,
    styleUrls: [`./motion-poll.component.scss`]
})
export class MotionPollComponent extends BaseMeetingComponent {
    public poll = input.required<ViewPoll>();

    public dialogOpened = output();

    public showPoll = computed<boolean>(() => {
        if (this.poll()) {
            if (
                this.operator.hasPerms(Permission.motionCanSeePolls) ||
                this.poll().isPublished ||
                (this.poll().isEVoting && !this.poll().isCreated)
            ) {
                return true;
            }
        }
        return false;
    });

    public isSameMeeting = computed<boolean>(() => {
        return !this.poll().meeting_id || this.activeMeetingId === this.poll().meeting_id;
    });

    private operator = inject(OperatorService);

    public getDetailLink = computed<string>(() => {
        return `/${this.activeMeetingId}/polls/${this.poll().sequential_number}`;
    });
}
