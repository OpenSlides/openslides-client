import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { map } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { OperatorService } from 'src/app/site/services/operator.service';
import { UserControllerService } from 'src/app/site/services/user-controller.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

@Component({
    selector: `os-poll-progress`,
    templateUrl: `./poll-progress.component.html`,
    styleUrls: [`./poll-progress.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollProgressComponent extends BaseUiComponent implements OnInit {
    @Input()
    public poll!: ViewPoll;

    @Input()
    public canManagePoll = false;

    public max: number = 1;

    public get votescast(): number {
        return this.poll?.vote_count || 0;
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
        private userRepo: UserControllerService,
        private operator: OperatorService,
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
        }
    }

    public get valueInPercent(): number {
        return (this.votescast / this.max) * 100;
    }
}
