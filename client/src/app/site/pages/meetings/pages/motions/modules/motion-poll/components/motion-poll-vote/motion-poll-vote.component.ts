import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { VoteValue } from 'src/app/domain/models/poll/vote-constants';
import {
    BasePollVoteComponent,
    VoteOption
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-vote/base-poll-vote.component';
import { PollControllerService } from 'src/app/site/pages/meetings/modules/poll/services/poll-controller.service/poll-controller.service';
import { VotingService } from 'src/app/site/pages/meetings/modules/poll/services/voting.service';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { ComponentServiceCollectorService } from 'src/app/site/services/component-service-collector.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewOption } from '../../../../../polls';

@Component({
    selector: `os-motion-poll-vote`,
    templateUrl: `../../../../../../modules/poll/components/base-poll-vote/base-poll-vote.component.html`,
    styleUrls: [`../../../../../../modules/poll/components/base-poll-vote/base-poll-vote.component.scss`]
})
export class MotionPollVoteComponent extends BasePollVoteComponent implements OnInit {
    public override readonly settings = {
        hideLeftoverVotes: true,
        hideGlobalOptions: true,
        hideSendNow: true,
        isSplitSingleOption: true
    };

    public constructor(
        private promptService: PromptService,
        operator: OperatorService,
        votingService: VotingService,
        cd: ChangeDetectorRef,
        pollRepo: PollControllerService,
        meetingSettingsService: MeetingSettingsService,
        componentServiceCollector: ComponentServiceCollectorService,
        translate: TranslateService
    ) {
        super(operator, votingService, cd, pollRepo, meetingSettingsService, componentServiceCollector, translate);
    }

    public ngOnInit(): void {
        this.cd.markForCheck();
    }

    public getActionButtonClass(voteOption: VoteOption, option: ViewOption, user: ViewUser = this.user): string {
        if (this.voteRequestData[user?.id]?.value === voteOption.vote) {
            return voteOption.css!;
        }
        return ``;
    }

    public async saveSingleVote(optionId: Id, vote: VoteValue, user: ViewUser = this.user): Promise<void> {
        if (!this.voteRequestData[user?.id]) {
            return;
        }
        this.voteRequestData[user.id].value = vote;

        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decision cannot be changed afterwards.`);
        const confirmed = await this.promptService.open(title, content);

        if (confirmed) {
            await super.submitVote(user, { [optionId]: vote });
        }
    }
}
