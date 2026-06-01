import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
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
}
