import { Component } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { VoteValue } from 'src/app/domain/models/poll/vote-constants';
import {
    BasePollVoteComponent,
    VoteOption
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-vote/base-poll-vote.component';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewOption } from '../../../../../polls';

@Component({
    selector: `os-motion-poll-vote`,
    templateUrl: `../../../../../../modules/poll/components/base-poll-vote/base-poll-vote.component.html`,
    styleUrls: [`../../../../../../modules/poll/components/base-poll-vote/base-poll-vote.component.scss`]
})
export class MotionPollVoteComponent extends BasePollVoteComponent {
    public override readonly settings = {
        hideLeftoverVotes: true,
        hideGlobalOptions: true,
        hideSendNow: true,
        isSplitSingleOption: true
    };

    public constructor(private promptService: PromptService, meetingSettingsService: MeetingSettingsService) {
        super(meetingSettingsService);
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
