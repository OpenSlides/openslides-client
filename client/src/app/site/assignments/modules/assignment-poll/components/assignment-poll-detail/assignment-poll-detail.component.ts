import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { PblColumnDefinition } from '@pebula/ngrid';

import { OperatorService } from 'app/core/core-services/operator.service';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { VoteRepositoryService } from 'app/core/repositories/polls/vote-repository.service';
import { GroupRepositoryService } from 'app/core/repositories/users/group-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { MeetingSettingsService } from 'app/core/ui-services/meeting-settings.service';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { ChartData } from 'app/shared/components/charts/charts.component';
import { VoteValue } from 'app/shared/models/poll/poll-constants';
import { BasePollDetailComponent, BaseVoteData } from 'app/site/polls/components/base-poll-detail.component';
import { ViewUser } from 'app/site/users/models/view-user';
import { AssignmentPollDialogService } from '../../services/assignment-poll-dialog.service';
import { AssignmentPollService } from '../../services/assignment-poll.service';

@Component({
    selector: 'os-assignment-poll-detail',
    templateUrl: './assignment-poll-detail.component.html',
    styleUrls: ['./assignment-poll-detail.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class AssignmentPollDetailComponent extends BasePollDetailComponent {
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
        repo: PollRepositoryService,
        route: ActivatedRoute,
        groupRepo: GroupRepositoryService,
        prompt: PromptService,
        pollDialog: AssignmentPollDialogService,
        pollService: AssignmentPollService,
        votesRepo: VoteRepositoryService,
        operator: OperatorService,
        cd: ChangeDetectorRef,
        meetingSettingsService: MeetingSettingsService,
        router: Router
    ) {
        super(
            componentServiceCollector,
            repo,
            route,
            router,
            groupRepo,
            prompt,
            pollDialog,
            pollService,
            votesRepo,
            operator,
            cd,
            meetingSettingsService
        );
    }

    protected onAfterSetup(): void {
        this.candidatesLabels = (this.pollService as AssignmentPollService).getChartLabels(this.poll);
        this.isReady = true;
    }

    protected createVotesData(): BaseVoteData[] {
        let votes = {};
        let isPseudoanonymized = true;
        for (const option of this.poll.options) {
            for (const vote of option.votes) {
                const userId = vote.user_id;
                if (!userId) {
                    continue;
                }
                isPseudoanonymized = false;
                if (!votes[userId]) {
                    votes[userId] = {
                        user: vote.user,
                        votes: []
                    };
                }

                if (vote.weight <= 0) {
                    continue;
                }
                if (this.poll.isMethodY) {
                    if (vote.value === 'Y') {
                        votes[userId].votes.push(option.content_object.getFullName());
                    } else {
                        votes[userId].votes.push(this.voteValueToLabel(vote.value));
                    }
                } else {
                    votes[userId].votes.push(
                        `${option.content_object.getShortName()}: ${this.voteValueToLabel(vote.value)}`
                    );
                }
            }
        }
        // if the poll was not pseudoanonymized, add all other users as empty votes
        if (!isPseudoanonymized) {
            votes = { ...votes, ...this.getEmptyVotes(this.poll.voted.filter(user => !votes[user.id])) };
        }
        return Object.values(votes);
    }

    private getEmptyVotes(usersWithEmptyVotes: ViewUser[]): { [user_id: number]: { user: ViewUser; votes: string[] } } {
        const result = {};
        for (const user of usersWithEmptyVotes) {
            result[user.id] = {
                user: user,
                votes: [this.translate.instant('empty vote')]
            };
        }
        return result;
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
        return this.operator.hasPerms(this.permission.assignmentsCanManage);
    }
}
