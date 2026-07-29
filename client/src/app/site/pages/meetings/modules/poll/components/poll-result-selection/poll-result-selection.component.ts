import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { VOTE_MAJORITY } from '@app/domain/models/poll';
import { ThemeService } from '@app/site/services/theme.service';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import Big from 'big.js';

import { UnknownUserLabel } from '../../../../pages/assignments/modules/assignment-poll/services/assignment-poll.service';
import { SelectionPollResult, ViewPollConfigSelection, ViewPollOption } from '../../../../pages/polls';
import { PollParseNumberPipe } from '../../pipes';
import { ChartComponent, ChartData } from '../chart/chart.component';
import { PollResultBaseComponent } from '../poll-result-base.component';
import { PollVoteOptionComponent } from '../poll-vote-option/poll-vote-option.component';

type Results = ResultRow[];
interface ResultRow {
    key: string;
    votingOption: string;
    color: string;
    amount: number;
    percent: number | null;
    option?: ViewPollOption;
}

/**
 * Colors for chart color generation
 * Keys are freely invented and not in sync with html color names
 */
export const pollChartColors = new Map<string, string>([
    [`green1`, `#5fbfa2`],
    [`red1`, `#f94144`],
    [`blue1`, `#317796`],
    [`orange1`, `#d4520c`],
    [`blue2`, `#509191`],
    [`orange2`, `#f9ac4e`],
    [`blue3`, `#6788a2`],
    [`orange3`, `#f8793a`],
    [`blue4`, `#6bbadb`],
    [`yellow1`, `#eca809`]
]);

const PollChartBarThickness = 20;

@Component({
    selector: 'os-poll-result-selection',
    imports: [
        IconContainerComponent,
        PollVoteOptionComponent,
        PollParseNumberPipe,
        ChartComponent,
        TranslatePipe,
        NgTemplateOutlet
    ],
    templateUrl: './poll-result-selection.component.html',
    styleUrl: './poll-result-selection.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultSelectionComponent extends PollResultBaseComponent<
    ViewPollConfigSelection,
    SelectionPollResult
> {
    public shouldShowEntitled = signal<boolean>(false);

    public themeService = inject(ThemeService);
    public translate = inject(TranslateService);

    public resultOptions = computed<Results>(() => {
        const results = this.results();

        const showPieChart = this.config().display_chart === `pie`;
        const showPercent =
            this.config().onehundred_percent_base !== `disabled` &&
            this.config().onehundredPercentBaseNum &&
            !this.options().some(o => +results[o.id] === VOTE_MAJORITY);
        const colors = this.generateChartColors(this.options()?.length ?? 0);

        const rows: Results = [];
        for (const i in this.options()) {
            const option = this.options()[i];
            const optionText = option.text
                ? option.text
                : (option.meeting_user?.user?.getName() ?? this.translate.instant(UnknownUserLabel));
            rows.push({
                key: option.fqid,
                option: option,
                votingOption: optionText,
                color: showPieChart ? colors[i] : null,
                amount: +results[option.id] || 0,
                percent: showPercent
                    ? Big(results[option.id] || 0)
                          .div(this.config().onehundredPercentBaseNum)
                          .mul(100)
                          .toNumber()
                    : null
            });
        }

        return rows;
    });

    public chartData = computed<ChartData>(() => {
        const results = this.results();
        const colors = this.generateChartColors(this.options()?.length ?? 0);
        return this.poll()
            .options.map((option, i) => {
                const optionText = option.text
                    ? option.text
                    : (option.meeting_user?.user?.getName() ?? this.translate.instant(UnknownUserLabel));
                return {
                    data: [+results[option.id]],
                    label: optionText,
                    backgroundColor: colors[i],
                    hoverBackgroundColor: colors[i],
                    barThickness: PollChartBarThickness,
                    maxBarThickness: PollChartBarThickness,
                    percent: null
                };
            })
            .filter(option => option.data[0]);
    });

    private generateChartColors(amount: number): string[] {
        let colors = Array.from(pollChartColors.values());
        while (colors.length < amount) {
            colors = colors.concat(Array.from(pollChartColors.values()));
        }
        while (colors.length > amount) {
            colors.pop();
        }
        return colors;
    }

    public displayChart = computed<boolean>(() => {
        const chartData = this.chartData();
        if (chartData.some(e => e.data[0] < 0)) {
            return false;
        }

        if (!chartData.some(e => e.data[0] > 0)) {
            return false;
        }

        return this.config().display_chart === `pie`;
    });

    public totalVoteSum = computed<number>(() => {
        return this.config().totalVotes!;
    });

    public validBallots = computed<number | null>(() => {
        if (this.config().onehundred_percent_base === `cast`) {
            return null;
        }

        return this.config().validBallots;
    });

    public validBallotsPercent = computed<string | null>(() => {
        if (!this.config().onehundredPercentBaseNum || this.config().onehundred_percent_base === 'no_general') {
            return null;
        }

        return this.formatResultDecimal((this.validBallots() / this.config().onehundredPercentBaseNum) * 100);
    });

    public invalidBallots = computed<number | null>(() => {
        if (this.config().onehundred_percent_base === `cast`) {
            return null;
        }

        return this.config().invalidBallots;
    });

    public invalidBallotsPercent = computed<string | null>(() => {
        if (!this.config().onehundredPercentBaseNum || this.config().onehundred_percent_base === 'no_general') {
            return null;
        }

        return this.formatResultDecimal((this.invalidBallots() / this.config().onehundredPercentBaseNum) * 100);
    });

    public castedBallots = computed<number | null>(() => {
        if (this.config().onehundred_percent_base !== `cast`) {
            return null;
        }

        return this.poll().ballot_user_ids?.length || 0;
    });

    public entitledUsers = computed<number | null>(() => {
        // TODO: Implement if available
        return null;
    });

    public presentEntitledUsers = computed<number | null>(() => {
        // TODO: Implement if available
        return null;
    });

    public generalAbstain = computed<number | null>(() => {
        if (this.config().min_options_amount !== 0) {
            return null;
        }

        return +this.config().parsedResult()?.abstain || 0;
    });

    public generalAbstainPercent = computed<string | null>(() => {
        if (
            !this.config().onehundredPercentBaseNum ||
            !this.generalAbstain() ||
            this.config().onehundred_percent_base === 'no_general'
        ) {
            return null;
        }

        return this.formatResultDecimal((this.generalAbstain() / this.config().onehundredPercentBaseNum) * 100);
    });

    public nota = computed<number | null>(() => {
        if (!this.config().allow_nota) {
            return null;
        }

        return +this.config().parsedResult()?.nota || 0;
    });

    public notaPercent = computed<string | null>(() => {
        if (
            !this.config().onehundredPercentBaseNum ||
            !this.nota() ||
            this.config().onehundred_percent_base === 'no_general'
        ) {
            return null;
        }

        return this.formatResultDecimal((this.nota() / this.config().onehundredPercentBaseNum) * 100);
    });
}
