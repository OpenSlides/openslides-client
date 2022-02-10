import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SimplifiedModelRequest } from 'app/core/core-services/model-request-builder.service';
import { OperatorService } from 'app/core/core-services/operator.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { ViewMeeting } from 'app/management/models/view-meeting';
import { PollClassType } from 'app/shared/models/poll/poll-constants';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { BaseModelContextComponent } from 'app/site/base/components/base-model-context.component';
import { map } from 'rxjs/operators';

@Component({
    selector: `os-poll-progress`,
    templateUrl: `./poll-progress.component.html`,
    styleUrls: [`./poll-progress.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollProgressComponent extends BaseModelContextComponent implements OnInit {
    @Input()
    public poll: ViewPoll;

    public max: number;

    public get votescast(): number {
        return this.poll?.vote_count || 0;
    }

    private get canSeeNames(): boolean {
        return this.operator.hasPerms(this.permission.userCanSee);
    }

    private get canManageSpeakers(): boolean {
        return this.operator.hasPerms(this.permission.listOfSpeakersCanManage);
    }

    /**
     * TODO: some non abstract poll function service is required.
     */
    private get canManagePoll(): boolean {
        if (this.poll.pollClassType === PollClassType.Motion) {
            return this.operator.hasPerms(this.permission.motionCanManagePolls);
        } else if (this.poll.pollClassType === PollClassType.Assignment) {
            return this.operator.hasPerms(this.permission.assignmentCanManage);
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
        protected translate: TranslateService,
        private userRepo: UserRepositoryService,
        private operator: OperatorService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        super.ngOnInit();
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
                                const inVoteGroup = this.poll.entitled_group_ids.intersect(
                                    user.group_ids(this.activeMeetingId)
                                ).length;

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
        }
    }

    public get valueInPercent(): number {
        return (this.votescast / this.max) * 100;
    }

    protected getModelRequest(): SimplifiedModelRequest {
        return {
            viewModelCtor: ViewMeeting,
            ids: [this.activeMeetingId],
            follow: [
                {
                    idField: `user_ids`,
                    fieldset: `voteProgress`,
                    follow: [
                        {
                            idField: `group_$_ids`
                        }
                    ]
                }
            ],
            fieldset: []
        };
    }
}
