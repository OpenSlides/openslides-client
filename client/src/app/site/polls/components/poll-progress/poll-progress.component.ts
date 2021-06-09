import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { map } from 'rxjs/operators';

import { ActiveMeetingIdService } from 'app/core/core-services/active-meeting-id.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PollClassType } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { BaseComponent } from 'app/site/base/components/base.component';

@Component({
    selector: 'os-poll-progress',
    templateUrl: './poll-progress.component.html',
    styleUrls: ['./poll-progress.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollProgressComponent extends BaseComponent implements OnInit {
    @Input()
    public poll: ViewPoll;

    public max: number;

    public get votescast(): number {
        return this.poll?.votescast || 0;
    }

    private get canSeeNames(): boolean {
        return this.operator.hasPerms(this.permission.usersCanSee);
    }

    private get canManageSpeakers(): boolean {
        return this.operator.hasPerms(this.permission.listOfSpeakersCanManage);
    }

    /**
     * TODO: some non abstract poll function service is required.
     */
    private get canManagePoll(): boolean {
        if (this.poll.pollClassType === PollClassType.Motion) {
            return this.operator.hasPerms(this.permission.motionsCanManagePolls);
        } else if (this.poll.pollClassType === PollClassType.Assignment) {
            return this.operator.hasPerms(this.permission.assignmentsCanManage);
        }
        return false;
    }

    public get canSeeProgressBar(): boolean {
        if (!this.canSeeNames) {
            return false;
        }
        return this.canManageSpeakers || this.canManagePoll;
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private userRepo: UserRepositoryService,
        private operator: OperatorService,
        private activeMeetingIdService: ActiveMeetingIdService,
        private cd: ChangeDetectorRef
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
                        this.cd.markForCheck();
                    }),
                this.operator.userObservable.subscribe(() => {
                    this.cd.markForCheck();
                })
            );
        }
    }

    public get valueInPercent(): number {
        return (this.votescast / this.max) * 100;
    }
}
