import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';

import { OperatorService } from 'app/core/core-services/operator.service';
import { Id } from 'app/core/definitions/key-types';
import { PollRepositoryService } from 'app/core/repositories/polls/poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { VotingService } from 'app/core/ui-services/voting.service';
import { VoteValue } from 'app/shared/models/poll/poll-constants';
import { BasePollVoteComponent, VoteOption } from 'app/site/polls/components/base-poll-vote.component';
import { ViewUser } from 'app/site/users/models/view-user';

@Component({
    selector: 'os-motion-poll-vote',
    templateUrl: './motion-poll-vote.component.html',
    styleUrls: ['./motion-poll-vote.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionPollVoteComponent extends BasePollVoteComponent implements OnInit {
    public voteOptions: VoteOption[] = [
        {
            vote: 'Y',
            css: 'voted-yes',
            icon: 'thumb_up',
            label: 'Yes'
        },
        {
            vote: 'N',
            css: 'voted-no',
            icon: 'thumb_down',
            label: 'No'
        },
        {
            vote: 'A',
            css: 'voted-abstain',
            icon: 'trip_origin',
            label: 'Abstain'
        }
    ];

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        operator: OperatorService,
        public votingService: VotingService,
        private pollRepo: PollRepositoryService,
        private promptService: PromptService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, operator, votingService);

        // observe user updates to refresh the view on dynamic changes
        this.subscriptions.push(
            operator.operatorIdObservable.subscribe(() => {
                this.cd.markForCheck();
            })
        );
    }

    public ngOnInit(): void {
        this.createVotingDataObjects();
        this.cd.markForCheck();
    }

    public getActionButtonClass(voteOption: VoteOption, user: ViewUser = this.user): string {
        if (this.voteRequestData[user.id]?.value === voteOption.vote) {
            return voteOption.css;
        }
        return '';
    }

    public async saveVote(vote: VoteValue, optionId: Id, user: ViewUser = this.user): Promise<void> {
        if (!this.voteRequestData[user.id]) {
            return;
        }
        this.voteRequestData[user.id].value = vote;

        const title = this.translate.instant('Submit selection now?');
        const content = this.translate.instant('Your decision cannot be changed afterwards.');
        const confirmed = await this.promptService.open(title, content);

        if (confirmed) {
            this.deliveringVote[user.id] = true;
            this.cd.markForCheck();

            this.pollRepo
                .vote(this.poll, user, { value: { [optionId]: vote } })
                .then(() => {
                    this.alreadyVoted[user.id] = true;
                })
                .catch(this.raiseError)
                .finally(() => {
                    this.deliveringVote[user.id] = false;
                    this.cd.markForCheck();
                });
        }
    }
}
