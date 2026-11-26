import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PollRequiredMajority, VOTE_MAJORITY } from '@app/domain/models/poll';
import { ApprovalOnehundredPercentBase } from '@app/domain/models/poll/poll-config-approval';
import { ThemeService } from '@app/site/services/theme.service';
import { IconContainerComponent } from '@app/ui/modules/icon-container';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import Big from 'big.js';

import { ViewPollConfigApproval } from '../../../../pages/polls/view-models/poll-config-approval';
import { ApprovalPollResult } from '../../../../pages/polls/view-models/poll-result-approval';
import { PollParseNumberPipe } from '../../pipes/poll-parse-number/poll-parse-number.pipe';
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
    imports: [IconContainerComponent, ChartComponent, TranslatePipe, PollParseNumberPipe, NgTemplateOutlet],
    templateUrl: './poll-result-approval.component.html',
    styleUrl: './poll-result-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultApprovalComponent extends PollResultBaseComponent<ViewPollConfigApproval, ApprovalPollResult> {
    private translate = inject(TranslateService);
    private themeService = inject(ThemeService);

    public shouldShowEntitled = signal<boolean>(false);

    public onehundredPercentBase = computed<ApprovalOnehundredPercentBase>(() => {
        return this.config.value().onehundred_percent_base;
    });

    public resultOptions = computed<Results>(() => {
        const results = this.results();
        if (!results) {
            return [];
        }

        const showPercent =
            this.config.value().onehundredPercentBaseNum &&
            this.onehundredPercentBase() !== `disabled` &&
            +results.yes !== VOTE_MAJORITY &&
            +results.no !== VOTE_MAJORITY &&
            +results.abstain !== VOTE_MAJORITY;
        const rows = [
            {
                key: `Y`,
                votingLabel: this.translate.instant(`Yes`),
                votingOption: `yes`,
                icon: `check_circle`,
                amount: +results.yes || 0,
                percent: showPercent
                    ? Big(results.yes || 0)
                          .div(this.config.value().onehundredPercentBaseNum)
                          .mul(100)
                          .toNumber()
                    : null
            },
            {
                key: `N`,
                votingLabel: this.translate.instant(`No`),
                votingOption: `no`,
                icon: `cancel`,
                amount: +results.no || 0,
                percent: showPercent
                    ? Big(results.no || 0)
                          .div(this.config.value().onehundredPercentBaseNum)
                          .mul(100)
                          .toNumber()
                    : null
            }
        ];

        if (this.config.value().allow_abstain) {
            rows.push({
                key: `A`,
                votingLabel: this.translate.instant(`Abstain`),
                votingOption: `abstain`,
                icon: `circle`,
                amount: +results.abstain || 0,
                percent:
                    this.onehundredPercentBase() !== `yes_no` &&
                    this.onehundredPercentBase() !== `disabled` &&
                    showPercent
                        ? Big(results.abstain || 0)
                              .div(this.config.value().onehundredPercentBaseNum)
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
            .filter(
                k =>
                    (k !== `abstain` || this.config.value().onehundred_percent_base !== `yes_no`) &&
                    (+results[k] || 0) > 0
            )
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
        return this.config.value().totalVotes!;
    });

    public validBallots = computed<number | null>(() => {
        if (this.onehundredPercentBase() === `cast` && !this.invalidBallots()) {
            return null;
        }

        return this.config.value().validBallots;
    });

    public validBallotsPercent = computed<string | null>(() => {
        if (
            !this.config.value().onehundredPercentBaseNum ||
            this.onehundredPercentBase() === `yes_no` ||
            this.onehundredPercentBase() === `disabled`
        ) {
            return null;
        }

        return this.formatResultDecimal((this.validBallots() / this.config.value().onehundredPercentBaseNum) * 100);
    });

    public invalidBallots = computed<number | null>(() => {
        return this.config.value().invalidBallots;
    });

    public invalidBallotsPercent = computed<string | null>(() => {
        if (!this.config.value().onehundredPercentBaseNum || this.onehundredPercentBase() !== `cast`) {
            return null;
        }

        return this.formatResultDecimal((this.invalidBallots() / this.config.value().onehundredPercentBaseNum) * 100);
    });

    public castedBallots = computed<number | null>(() => {
        if (this.onehundredPercentBase() !== `cast` && !this.invalidBallots()) {
            return null;
        }

        return this.config.value().parsedResult()?.total_ballots;
    });

    public entitledUsers = computed<number | null>(() => {
        if (this.config.value().onehundred_percent_base !== `entitled`) {
            return null;
        }

        return this.poll().entitled_user_ids?.length;
    });

    public presentEntitledUsers = computed<number | null>(() => {
        if (this.config.value().onehundred_percent_base !== `entitled_present`) {
            return null;
        }

        return this.poll().entitled_users?.filter(u => u.present).length;
    });

    public majorityReached = computed<boolean | undefined>(() => {
        if (!this.config.value().onehundredPercentBaseNum) {
            return undefined;
        }

        if (this.config.value().required_majority === PollRequiredMajority.AbsoluteMajority) {
            return +this.results().yes > this.config.value().onehundredPercentBaseNum / 2;
        } else if (this.config.value().required_majority === PollRequiredMajority.TwoThirdMajority) {
            return +this.results().yes >= (this.config.value().onehundredPercentBaseNum * 2) / 3;
        }

        return undefined;
    });
}
