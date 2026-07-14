import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RatingApprovalOnehundredPercentBase } from '@app/domain/models/poll/poll-config-rating-approval';
import { TranslatePipe } from '@ngx-translate/core';
import Big from 'big.js';

import { RatingApprovalPollResult, ViewPollConfigRatingApproval, ViewPollOption } from '../../../../pages/polls';
import { PollParseNumberPipe } from '../../pipes';
import { PollResultBaseComponent } from '../poll-result-base.component';
import { PollVoteOptionComponent } from '../poll-vote-option/poll-vote-option.component';

type Results = ResultRow[];
interface ResultRow {
    option: ViewPollOption;
    yes: number;
    yes_percent: number | null;
    no: number;
    no_percent: number | null;
    abstain: number;
    abstain_percent: number | null;
}

@Component({
    selector: 'os-poll-result-rating-approval',
    imports: [PollVoteOptionComponent, PollParseNumberPipe, TranslatePipe, NgTemplateOutlet],
    templateUrl: './poll-result-rating-approval.component.html',
    styleUrl: './poll-result-rating-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultRatingApprovalComponent extends PollResultBaseComponent<
    ViewPollConfigRatingApproval,
    RatingApprovalPollResult
> {
    public onehundredPercentBase = computed<RatingApprovalOnehundredPercentBase>(() => {
        return this.config().onehundred_percent_base;
    });

    public resultOptions = computed<Results>(() => {
        const results = this.results();
        if (!results) {
            return [];
        }

        const rows: Results = [];
        for (const option of this.options()) {
            const onehundredBase = this.config().getOptionOnehundredPercentBaseNum(option);
            rows.push({
                option,
                yes: +results[option.id]?.yes || 0,
                yes_percent: onehundredBase
                    ? Big(results[option.id]?.yes || 0)
                          .div(onehundredBase)
                          .mul(100)
                          .toNumber()
                    : onehundredBase,
                no: +results[option.id]?.no || 0,
                no_percent: onehundredBase
                    ? Big(results[option.id]?.no || 0)
                          .div(onehundredBase)
                          .mul(100)
                          .toNumber()
                    : onehundredBase,
                abstain: +results[option.id]?.abstain || 0,
                abstain_percent: onehundredBase
                    ? Big(results[option.id]?.abstain || 0)
                          .div(onehundredBase)
                          .mul(100)
                          .toNumber()
                    : onehundredBase
            });
        }

        return rows;
    });

    public totalVoteSum = computed<number>(() => {
        return this.config().totalVotes!;
    });

    public validBallots = computed<number | null>(() => {
        if (this.onehundredPercentBase() === `cast`) {
            return null;
        }

        return this.config().validBallots;
    });

    public validBallotsPercent = computed<string | null>(() => {
        if (!this.config().onehundredPercentBaseNum) {
            return null;
        }

        return this.formatResultDecimal((this.validBallots() / this.config().onehundredPercentBaseNum) * 100);
    });

    public invalidBallots = computed<number | null>(() => {
        if (this.onehundredPercentBase() === `cast`) {
            return null;
        }

        return this.config().invalidBallots;
    });

    public invalidBallotsPercent = computed<string | null>(() => {
        if (!this.config().onehundredPercentBaseNum) {
            return null;
        }

        return this.formatResultDecimal((this.invalidBallots() / this.config().onehundredPercentBaseNum) * 100);
    });

    public castedBallots = computed<number | null>(() => {
        if (this.onehundredPercentBase() !== `cast`) {
            return null;
        }

        return this.config().parsedResult().total_ballots;
    });

    public entitledUsers = computed<number | null>(() => {
        // TODO: Implement if available
        return null;
    });

    public presentEntitledUsers = computed<number | null>(() => {
        // TODO: Implement if available
        return null;
    });
}
