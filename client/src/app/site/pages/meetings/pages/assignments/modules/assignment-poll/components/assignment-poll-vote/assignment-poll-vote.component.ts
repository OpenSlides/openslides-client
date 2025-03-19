import { ChangeDetectionStrategy, Component } from '@angular/core';
import { _ } from '@ngx-translate/core';
import { PollMethod } from 'src/app/domain/models/poll/poll-constants';
import { VoteValue } from 'src/app/domain/models/poll/vote-constants';
import {
    BasePollVoteComponent,
    VoteOption
} from 'src/app/site/pages/meetings/modules/poll/components/base-poll-vote/base-poll-vote.component';
import { ViewAssignment } from 'src/app/site/pages/meetings/pages/assignments';
import { ViewOption } from 'src/app/site/pages/meetings/pages/polls';
import { MeetingSettingsService } from 'src/app/site/pages/meetings/services/meeting-settings.service';
import { ViewUser } from 'src/app/site/pages/meetings/view-models/view-user';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { UnknownUserLabel } from '../../services/assignment-poll.service';

@Component({
    selector: `os-assignment-poll-vote`,
    templateUrl: `../../../../../../modules/poll/components/base-poll-vote/base-poll-vote.component.html`,
    styleUrls: [`../../../../../../modules/poll/components/base-poll-vote/base-poll-vote.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AssignmentPollVoteComponent extends BasePollVoteComponent<ViewAssignment> {
    public unknownUserLabel = UnknownUserLabel;
    public AssignmentPollMethod = PollMethod;

    public override get pollHint(): string | null {
        if (this.poll?.content_object) {
            return this.poll.content_object!.default_poll_description;
        }
        return null;
    }

    public override readonly maxVotesPerOptionSuffix = _(`votes per candidate`);

    public override readonly optionPluralLabel: string = _(`Candidates`);

    private get assignment(): ViewAssignment {
        return this.poll.content_object;
    }

    public get enumerateCandidates(): boolean {
        return this.assignment?.number_poll_candidates || false;
    }

    public constructor(
        private promptService: PromptService,
        meetingSettingsService: MeetingSettingsService
    ) {
        super(meetingSettingsService);
    }

    public getActionButtonClass(actions: VoteOption, option: ViewOption, user: ViewUser = this.user): string {
        if (
            this.voteRequestData[user?.id]?.value[option.id] === actions.vote ||
            this.voteRequestData[user?.id]?.value[option.id] === 1
        ) {
            return actions.css!;
        }
        return ``;
    }

    public override async submitVote(user: ViewUser = this.user): Promise<void> {
        const value = this.voteRequestData[user.id].value;
        if (this.poll.isMethodY && this.poll.max_votes_per_option > 1 && this.isErrorInVoteEntry()) {
            this.raiseError(this.translate.instant(`There is an error in your vote.`));
            return;
        }
        const title = this.translate.instant(`Submit selection now?`);
        let content = this.translate.instant(`Your decision cannot be changed afterwards.`);
        if (this.poll.max_votes_amount > 1 && !this.isGlobalOptionSelected()) {
            content =
                this.translate.instant(`Your votes`) +
                `: ${this.getVotesCount(user)}/${this.poll.max_votes_amount}<br>` +
                content;
        }
        const confirmed = await this.promptService.open(title, content);
        if (confirmed) {
            await super.submitVote(user, value);
        }
    }

    public saveSingleVote(optionId: number, vote?: VoteValue, user: ViewUser = this.user): void {
        if (!this.voteRequestData[user.id]) {
            throw new Error(`The user for your voting request does not exist`);
        }

        if (this.isGlobalOptionSelected(user)) {
            this.voteRequestData[user.id].value = {};
        }

        if (this.poll.isMethodY || this.poll.isMethodN) {
            const maxVotesAmount = this.poll.max_votes_amount;
            const tmpVoteRequest = this.poll.options
                .map(option => option.id)
                .reduce((o: any, n) => {
                    o[n] = 0;
                    if (maxVotesAmount === 1) {
                        if (n === optionId && this.voteRequestData[user.id].value[n] !== 1) {
                            o[n] = 1;
                        }
                    } else if ((n === optionId) !== (this.voteRequestData[user.id].value[n] === 1)) {
                        o[n] = 1;
                    }

                    return o;
                }, {});

            // check if you can still vote
            const countedVotes = Object.keys(tmpVoteRequest).filter(key => tmpVoteRequest[key]).length;
            if (countedVotes <= maxVotesAmount) {
                this.voteRequestData[user.id].value = tmpVoteRequest;

                // if you have no options anymore, try to send
                if (this.getVotesCount(user) === maxVotesAmount) {
                    this.submitVote(user);
                }
            } else {
                this.raiseError(
                    this.translate.instant(`You reached the maximum amount of votes. Deselect somebody first.`)
                );
            }
        } else {
            // YN/YNA
            if (
                this.voteRequestData[user.id].value[optionId] &&
                this.voteRequestData[user.id].value[optionId] === vote
            ) {
                delete (this.voteRequestData[user.id] as any).value[optionId];
            } else {
                (this.voteRequestData[user.id] as any).value[optionId] = vote;
            }
            const maxVotesAmount = this.poll.max_votes_amount;
            const countedVotes = Object.keys(this.voteRequestData[user.id].value).length;
            if (countedVotes <= maxVotesAmount) {
                if (this.getVotesCount(user) === maxVotesAmount) {
                    this.submitVote(user);
                }
            } else {
                this.raiseError(
                    this.translate.instant(`You reached the maximum amount of votes. Deselect somebody first.`)
                );
                delete (this.voteRequestData[user.id] as any).value[optionId];
            }

            // if a user filled out every option, try to send
            if (Object.keys(this.voteRequestData[user.id].value).length === this.poll.options.length) {
                this.submitVote(user);
            }
        }
    }

    public override shouldStrikeOptionText(option: ViewOption, user: ViewUser = this.user): boolean {
        if (this.poll.pollmethod === PollMethod.N) {
            return !!this.voteRequestData[user.id].value[option.id];
        }
        return false;
    }
}
