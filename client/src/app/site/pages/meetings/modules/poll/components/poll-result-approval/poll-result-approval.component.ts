import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { VOTE_MAJORITY } from '@app/domain/models/poll';
import { ApprovalOnehundredPercentBase } from '@app/domain/models/poll/poll-config-approval';
import { ThemeService } from '@app/site/services/theme.service';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { TranslatePipe } from '@ngx-translate/core';
import Big from 'big.js';

import { ApprovalPollResult, ViewPollConfigApproval } from '../../../../pages/polls';
import { PollKeyVerbosePipe, PollParseNumberPipe } from '../../pipes';
import { ChartComponent, ChartData } from '../chart/chart.component';
import { PollResultBaseComponent } from '../poll-result-base.component';

const PollChartBarThickness = 20;

type Results = ResultRow[];
interface ResultRow {
    key: string;
    votingOption: string;
    icon: string;
    amount: number;
    percent: number | null;
}

@Component({
    selector: 'os-poll-result-approval',
    imports: [
        IconContainerComponent,
        ChartComponent,
        TranslatePipe,
        PollKeyVerbosePipe,
        PollParseNumberPipe,
        NgTemplateOutlet
    ],
    templateUrl: './poll-result-approval.component.html',
    styleUrl: './poll-result-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultApprovalComponent extends PollResultBaseComponent<ViewPollConfigApproval, ApprovalPollResult> {
    private themeService = inject(ThemeService);

    public shouldShowEntitled = signal<boolean>(false);

    public onehundredPercentBase = computed<ApprovalOnehundredPercentBase>(() => {
        return this.config().onehundred_percent_base;
    });

    public resultOptions = computed<Results>(() => {
        const results = this.results();
        if (!results) {
            return [];
        }

        const showPercent =
            this.config().onehundredPercentBaseNum &&
            this.onehundredPercentBase() !== `disabled` &&
            +results.yes !== VOTE_MAJORITY &&
            +results.no !== VOTE_MAJORITY &&
            +results.abstain !== VOTE_MAJORITY;
        const rows = [
            {
                key: `Y`,
                votingOption: `yes`,
                icon: `check_circle`,
                amount: +results.yes || 0,
                percent: showPercent
                    ? Big(results.yes || 0)
                          .div(this.config().onehundredPercentBaseNum)
                          .mul(100)
                          .toNumber()
                    : null
            },
            {
                key: `N`,
                votingOption: `no`,
                icon: `cancel`,
                amount: +results.no || 0,
                percent: showPercent
                    ? Big(results.no || 0)
                          .div(this.config().onehundredPercentBaseNum)
                          .mul(100)
                          .toNumber()
                    : null
            }
        ];

        if (this.config().allow_abstain) {
            rows.push({
                key: `A`,
                votingOption: `abstain`,
                icon: `circle`,
                amount: +results.abstain || 0,
                percent:
                    this.onehundredPercentBase() === `yes_no_abstain`
                        ? Big(results.abstain || 0)
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
        if (!results) {
            return [];
        }

        return [`yes`, `no`, `abstain`]
            .filter(k => k !== `abstain` || this.config().onehundred_percent_base !== `yes_no`)
            .map(key => {
                return {
                    data: [+results[key] || 0],
                    label: key,
                    backgroundColor: this.themeService.getPollColor(key),
                    hoverBackgroundColor: this.themeService.getPollColor(key),
                    barThickness: PollChartBarThickness,
                    maxBarThickness: PollChartBarThickness
                };
            });
    });

    public displayChart = computed<boolean>(() => {
        const chartData = this.chartData();
        if (chartData.some(e => e.data[0] < 0)) {
            return false;
        }

        if (!chartData.some(e => e.data[0] > 0)) {
            return false;
        }

        return true;
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

        return this.config().parsedResult()?.total_ballots;
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
