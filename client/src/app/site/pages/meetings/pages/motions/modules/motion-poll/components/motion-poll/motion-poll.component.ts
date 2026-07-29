import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { Permission } from '@app/domain/definitions/permission';
import { ProjectorButtonModule } from '@app/site/pages/meetings/modules/meetings-component-collector/projector-button/projector-button.module';
import { BasePollComponent } from '@app/site/pages/meetings/modules/poll/base/base-poll.component';
import { PollComponent } from '@app/site/pages/meetings/modules/poll/components/poll/poll.component';
import { OperatorService } from '@app/site/services/operator.service';
import { DirectivesModule } from '@app/ui/directives';
import { TranslatePipe } from '@ngx-translate/core';

import { ViewPoll } from '../../../../../polls';

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
    styleUrls: [`./motion-poll.component.scss`],
    changeDetection: ChangeDetectionStrategy.Eager
})
export class MotionPollComponent extends BasePollComponent {
    public pollViewModel = input.required<ViewPoll>();

    public dialogOpened = output();

    public get showPoll(): boolean {
        if (this.poll) {
            if (
                this.operator.hasPerms(Permission.motionCanSeePolls) ||
                this.poll.isPublished ||
                (this.poll.isEVoting && !this.poll.isCreated)
            ) {
                return true;
            }
        }
        return false;
    }

    public get isSameMeeting(): boolean {
        return !this.poll.meeting_id || this.activeMeetingId === this.poll.meeting_id;
    }

    private operator = inject(OperatorService);

    public constructor() {
        super();

        effect(() => {
            this.poll = this.pollViewModel();
        });
    }

    public getDetailLink(): string {
        return `/${this.activeMeetingId}/polls/${this.poll.sequential_number}`;
    }
}
