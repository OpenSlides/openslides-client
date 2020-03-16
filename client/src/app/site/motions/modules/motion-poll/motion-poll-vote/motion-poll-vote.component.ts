import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';

import { OperatorService } from 'app/core/core-services/operator.service';
import { MotionPollRepositoryService } from 'app/core/repositories/motions/motion-poll-repository.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PromptService } from 'app/core/ui-services/prompt.service';
import { VotingService } from 'app/core/ui-services/voting.service';
import { VoteValue } from 'app/shared/models/poll/base-vote';
import { ViewMotionPoll } from 'app/site/motions/models/view-motion-poll';
import { BasePollVoteComponent } from 'app/site/polls/components/base-poll-vote.component';

interface VoteOption {
    vote?: VoteValue;
    css?: string;
    icon?: string;
    label?: string;
}

@Component({
    selector: 'os-motion-poll-vote',
    templateUrl: './motion-poll-vote.component.html',
    styleUrls: ['./motion-poll-vote.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionPollVoteComponent extends BasePollVoteComponent<ViewMotionPoll> {
    public currentVote: VoteOption = {};
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
        public vmanager: VotingService,
        private pollRepo: MotionPollRepositoryService,
        private promptService: PromptService,
        private cd: ChangeDetectorRef
    ) {
        super(componentServiceCollector, operator);
    }

    public async saveVote(vote: VoteValue): Promise<void> {
        this.currentVote.vote = vote;
        const title = this.translate.instant('Submit selection now?');
        const content = this.translate.instant('Your decision cannot be changed afterwards.');
        const confirmed = await this.promptService.open(title, content);

        if (confirmed) {
            this.deliveringVote = true;
            this.cd.markForCheck();

            this.pollRepo
                .vote(vote, this.poll.id)
                .catch(this.raiseError)
                .finally(() => {
                    this.deliveringVote = false;
                });
        }
    }
}
