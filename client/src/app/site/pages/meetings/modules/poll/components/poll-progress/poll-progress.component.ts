import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Permission } from '@app/domain/definitions/permission';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls';
import { AutoupdateService } from '@app/site/services/autoupdate';
import { ModelRequestBuilderService } from '@app/site/services/model-request-builder';
import { OperatorService } from '@app/site/services/operator.service';
import { UserControllerService } from '@app/site/services/user-controller.service';
import { BaseUiComponent } from '@app/ui/base/base-ui-component';
import { map } from 'rxjs';

import { getParticipantVoteInfoSubscriptionConfig } from '../../../../pages/participants/participants.subscription';
import { ActiveMeetingService } from '../../../../services/active-meeting.service';

@Component({
    selector: `os-poll-progress`,
    templateUrl: `./poll-progress.component.html`,
    styleUrls: [`./poll-progress.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PollProgressComponent extends BaseUiComponent implements OnInit {
    @Input()
    public poll!: ViewPoll;

    @Input()
    public canManagePoll = false;

    public max = 1;

    public get votescast(): number {
        return Object.keys(this.poll?.live_votes ?? {}).length;
    }

    public get canSeeProgressBar(): boolean {
        if (!this.canSeeNames) {
            return false;
        }
        return this.canManageSpeakers || this.canManagePoll;
    }

    private get canSeeNames(): boolean {
        return this.operator.hasPerms(Permission.userCanSee);
    }

    private get canManageSpeakers(): boolean {
        return this.operator.hasPerms(Permission.listOfSpeakersCanManage);
    }

    public constructor(
        private autoupdate: AutoupdateService,
        private userRepo: UserControllerService,
        private operator: OperatorService,
        private activeMeeting: ActiveMeetingService,
        private modelRequestBuilder: ModelRequestBuilderService,
        private cd: ChangeDetectorRef
    ) {
        super();
    }

    public ngOnInit(): void {
        if (this.poll) {
            this.subscriptions.push(
                this.userRepo
                    .getViewModelListObservable()
                    .pipe(
                        map(users => {
                            /**
                             * Filter the users who would be able to vote:
                             * They are present and don't have their vote right delegated
                             * or the have their vote delegated to a user who is present.
                             * They are in one of the voting groups
                             */
                            return users.filter(user => {
                                const countable = user.isVoteCountable;
                                const inVoteGroup = this.poll.entitled_group_ids.intersect(user.group_ids()).length;

                                return countable && inVoteGroup;
                            });
                        })
                    )
                    .subscribe(users => {
                        this.max = users.length;
                        this.cd.markForCheck();
                    }),
                this.operator.userObservable.subscribe(() => {
                    this.cd.markForCheck();
                })
            );

            if (this.canSeeProgressBar) {
                const subscriptionConfig = getParticipantVoteInfoSubscriptionConfig(this.activeMeeting.meetingId);
                this.modelRequestBuilder.build(subscriptionConfig.modelRequest).then(modelRequest => {
                    this.autoupdate.subscribe(modelRequest, subscriptionConfig.subscriptionName);
                });
            }
        }
    }

    public get valueInPercent(): number {
        return (this.votescast / this.max) * 100;
    }
}
