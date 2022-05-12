import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    BasePollVoteComponent,
    VoteOption
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-vote.component';
import { OperatorService } from 'src/app/site/services/operator.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service/poll-controller.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { VoteValue } from 'src/app/domain/models/poll/vote-constants';
import { Id } from 'src/app/domain/definitions/key-types';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { TranslateService } from '@ngx-translate/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

@Component({
    selector: 'os-motion-poll-vote',
    templateUrl: './motion-poll-vote.component.html',
    styleUrls: ['./motion-poll-vote.component.scss']
})
export class MotionPollVoteComponent extends BasePollVoteComponent implements OnInit {
    public voteOptions: VoteOption[] = [
        {
            vote: `Y`,
            css: `voted-yes`,
            icon: `thumb_up`,
            label: `Yes`
        },
        {
            vote: `N`,
            css: `voted-no`,
            icon: `thumb_down`,
            label: `No`
        },
        {
            vote: `A`,
            css: `voted-abstain`,
            icon: `trip_origin`,
            label: `Abstain`
        }
    ];

    public constructor(
        operator: OperatorService,
        votingService: VotingService,
        pollRepo: PollControllerService,
        cd: ChangeDetectorRef,
        private translate: TranslateService,
        private promptService: PromptService
    ) {
        super(operator, votingService, cd, pollRepo);
    }

    public ngOnInit(): void {
        this.cd.markForCheck();
    }

    public getActionButtonClass(voteOption: VoteOption, user: ViewUser = this.user): string {
        if (this.voteRequestData[user?.id]?.value === voteOption.vote) {
            return voteOption.css!;
        }
        return ``;
    }

    public async saveVote(vote: VoteValue, optionId: Id, user: ViewUser = this.user): Promise<void> {
        if (!this.voteRequestData[user?.id]) {
            return;
        }
        this.voteRequestData[user.id].value = vote;

        const title = _(`Submit selection now?`);
        const content = _(`Your decision cannot be changed afterwards.`);
        const confirmed = await this.promptService.open(title, content);

        if (confirmed) {
            this.deliveringVote[user.id] = true;
            this.cd.markForCheck();

            const votePayload = {
                value: { [optionId]: vote },
                user_id: user.id
            };
            await this.sendVote(user.id, votePayload);
        }
    }
}
