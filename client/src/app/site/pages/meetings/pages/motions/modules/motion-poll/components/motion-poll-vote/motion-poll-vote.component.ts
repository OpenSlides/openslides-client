import { Component, OnInit } from '@angular/core';
import { Id } from 'src/app/domain/definitions/key-types';
import { VoteValue } from 'src/app/domain/models/poll/vote-constants';
import {
    BasePollVoteComponent,
    VoteOption
} from 'src/app/site/pages/meetings/modules/poll/base/base-poll-vote.component';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

@Component({
    selector: `os-motion-poll-vote`,
    templateUrl: `./motion-poll-vote.component.html`,
    styleUrls: [`./motion-poll-vote.component.scss`]
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

    public constructor(private promptService: PromptService, meetingSettingsService: MeetingSettingsService) {
        super(meetingSettingsService);
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

        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decision cannot be changed afterwards.`);
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
