import { Component, Input, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { BaseComponent } from 'app/site/base/components/base.component';

@Component({
    selector: 'os-poll-progress',
    templateUrl: './poll-progress.component.html',
    styleUrls: ['./poll-progress.component.scss']
})
export class PollProgressComponent extends BaseComponent implements OnInit {
    @Input()
    public poll: ViewPoll;

    public max: number;

    public get votescast(): number {
        return this.poll?.votescast || 0;
    }

    public get canSeeProgressBar(): boolean {
        let canManage = false;
        if (this.poll?.isMotionPoll) {
            canManage = this.operator.hasPerms(this.permission.motionsCanManagePolls);
        } else if (this.poll?.isAssignmentPoll) {
            canManage = this.operator.hasPerms(this.permission.assignmentsCanManage);
        }
        return canManage && this.operator.hasPerms(this.permission.usersCanSee);
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private userRepo: UserRepositoryService,
        private operator: OperatorService,
        private activeMeetingIdService: ActiveMeetingIdService
    ) {
        super(componentServiceCollector);
    }

    public ngOnInit(): void {
        if (this.poll) {
            this.subscriptions.push(
                this.userRepo
                    .getViewModelListObservable()
                    .pipe(
                        map(users =>
                            /**
                             * Filter the users who would be able to vote:
                             * They are present and don't have their vote right delegated
                             * or the have their vote delegated to a user who is present.
                             * They are in one of the voting groups
                             */
                            users.filter(
                                user =>
                                    user.isPresentInMeeting &&
                                    this.poll.entitled_group_ids.intersect(
                                        user.group_ids(this.activeMeetingIdService.meetingId)
                                    ).length
                            )
                        )
                    )
                    .subscribe(users => {
                        this.max = users.length;
                    })
            );
        }
    }

    public get valueInPercent(): number {
        return (this.votescast / this.max) * 100;
    }
}
