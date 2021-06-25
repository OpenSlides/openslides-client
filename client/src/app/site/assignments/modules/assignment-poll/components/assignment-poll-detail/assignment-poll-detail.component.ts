import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { PblColumnDefinition } from '@pebula/ngrid';

import { OperatorService } from 'app/core/core-services/operator.service';
import { Permission } from 'app/core/core-services/permission';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from 'app/core/repositories/polls/vote-repository.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { UserRepositoryService } from 'app/core/repositories/users/user-repository.service';
import { BasePollDialogService } from 'app/core/ui-services/base-poll-dialog.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ChartData } from 'app/shared/components/charts/charts.component';
import { VoteValue } from 'app/shared/models/poll/poll-constants';
import { ViewOption } from 'app/shared/models/poll/view-option';
import { ViewPoll } from 'app/shared/models/poll/view-poll';
import { ViewAssignment } from 'app/site/assignments/models/view-assignment';
import { BasePollDetailComponentDirective } from 'app/site/polls/components/base-poll-detail.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { AssignmentPollService } from '../../services/assignment-poll.service';

@Component({
    selector: 'os-assignment-poll-detail',
    templateUrl: './assignment-poll-detail.component.html',
    styleUrls: ['./assignment-poll-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AssignmentPollDetailComponent extends BasePollDetailComponentDirective<
    ViewPoll<ViewAssignment>,
    AssignmentPollService
> {
    public columnDefinitionSingleVotes: PblColumnDefinition[] = [
        {
            prop: 'user',
            label: 'Participant',
            width: '40%',
            minWidth: 300
        },
        {
            prop: 'votes',
            label: 'Votes',
            width: '60%',
            minWidth: 300
        }
    ];

    public filterProps = ['user.getFullName'];

    public isReady = false;

    public candidatesLabels: string[] = [];

    public get showResults(): boolean {
        return this.hasPerms() || this.poll.isPublished;
    }

    public get chartData(): ChartData {
        return this.pollService.generateChartData(this.poll);
    }

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected repo: PollRepositoryService,
        protected route: ActivatedRoute,
        protected groupRepo: GroupRepositoryService,
        protected promptService: PromptService,
        protected pollDialog: BasePollDialogService,
        protected pollService: AssignmentPollService,
        protected votesRepo: VoteRepositoryService,
        protected operator: OperatorService,
        protected cd: ChangeDetectorRef,
        protected meetingSettingsService: MeetingSettingsService,
        protected userRepo: UserRepositoryService,
        private router: Router
    ) {
        super(
            componentServiceCollector,
            repo,
            route,
            groupRepo,
            promptService,
            pollDialog,
            pollService,
            votesRepo,
            operator,
            cd,
            meetingSettingsService,
            userRepo
        );
    }

    protected createVotesData(): void {
        const votes = {};
        const pollOptions: ViewOption<ViewAssignment>[] = this.poll.options;
        for (const option of pollOptions) {
            for (const vote of option.votes) {
                const token = vote.user_token;
                if (!token) {
                    throw new Error(`assignment_vote/${vote.id} does not contain a user_token`);
                }
                if (!votes[token]) {
                    votes[token] = {
                        user: vote.user,
                        votes: []
                    };
                }

                if (vote.weight > 0) {
                    const optionContent: ViewUser = option.content_object;
                    if (this.poll.isMethodY) {
                        if (vote.value === 'Y') {
                            votes[token].votes.push(optionContent.getFullName());
                        } else {
                            votes[token].votes.push(this.voteValueToLabel(vote.value));
                        }
                    } else {
                        const candidate_name = optionContent?.getShortName() ?? this.translate.instant('Deleted user');
                        votes[token].votes.push(`${candidate_name}: ${this.voteValueToLabel(vote.value)}`);
                    }
                }
            }
        }
        this.setVotesData(Object.values(votes));
        this.candidatesLabels = this.pollService.getChartLabels(this.poll);
        this.isReady = true;
        this.cd.markForCheck();
    }

    private voteValueToLabel(vote: VoteValue): string {
        if (vote === 'Y') {
            return this.translate.instant('Yes');
        } else if (vote === 'N') {
            return this.translate.instant('No');
        } else if (vote === 'A') {
            return this.translate.instant('Abstain');
        } else {
            throw new Error(`voteValueToLabel received illegal arguments: ${vote}`);
        }
    }

    protected hasPerms(): boolean {
        return this.operator.hasPerms(Permission.assignmentsCanManage);
    }

    protected onDeleted(): void {
        this.router.navigateByUrl(this.poll.getContentObjectDetailStateURL());
    }
}
