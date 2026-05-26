import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ApprovalOnehundredPercentBase } from 'src/app/domain/models/poll/poll-config-approval';
import { ThemeService } from 'src/app/site/services/theme.service';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';

import { ViewPollConfigApproval } from '../../../../pages/polls';
import { PollKeyVerbosePipe, PollParseNumberPipe, PollPercentBasePipe } from '../../pipes';
import { ChartComponent, ChartData } from '../chart/chart.component';
import { PollResultBaseComponent } from '../poll-result-base.component';

const PollChartBarThickness = 20;
// const PERCENT_DECIMAL_PLACES = 3;

type Results = ResultRow[];
interface ResultRow {
    key: string;
    votingOption: string;
    icon: string;
    amount: number;
    showPercent: boolean;
}

interface ResultsRaw {
    yes: string;
    no: string;
    abstain?: string;
    invalid?: number;
}

@Component({
    selector: 'os-poll-result-approval',
    imports: [
        IconContainerComponent,
        ChartComponent,
        TranslatePipe,
        PollKeyVerbosePipe,
        PollParseNumberPipe,
        PollPercentBasePipe
    ],
    templateUrl: './poll-result-approval.component.html',
    styleUrl: './poll-result-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultApprovalComponent extends PollResultBaseComponent<ViewPollConfigApproval, ResultsRaw> {
    private themeService = inject(ThemeService);

    public shouldShowEntitled = signal<boolean>(false);

    private onehundredPercentBase = computed<ApprovalOnehundredPercentBase>(() => {
        return this.config().onehundred_percent_base;
    });

    public resultOptions = computed<Results>(() => {
        const results = this.results();
        if (!results) {
            return [];
        }

        const showPercent =
            this.onehundredPercentBase() === `yes_no` || this.onehundredPercentBase() === `yes_no_abstain`;
        const rows = [
            {
                key: `Y`,
                votingOption: `yes`,
                icon: `check_circle`,
                amount: +results.yes || 0,
                showPercent
            },
            {
                key: `N`,
                votingOption: `no`,
                icon: `cancel`,
                amount: +results.no || 0,
                showPercent
            }
        ];

        if (this.config().allow_abstain) {
            rows.push({
                key: `A`,
                votingOption: `abstain`,
                icon: `circle`,
                amount: +results.abstain || 0,
                showPercent: this.onehundredPercentBase() === `yes_no_abstain`
            });
        }

        return rows;
    });

    public chartData = computed<ChartData>(() => {
        const results = this.results();
        if (!results) {
            return [];
        }

        return Object.keys(results)
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

    public validBallots = computed<number | null>(() => {
        if (this.onehundredPercentBase() === `cast`) {
            return null;
        }

        return this.poll().ballot_ids.length - (this.results().invalid ?? 0);
    });

    public validBallotsPercent = computed<string | null>(() => {
        if (this.validBallots() === null) {
            return null;
        }

        if (!this.config().allow_abstain && this.onehundredPercentBase() === 'yes_no') {
            return `100%`;
        }

        switch (this.onehundredPercentBase()) {
            case 'yes_no_abstain':
            case 'valid':
                return `100%`;
            case 'entitled':
            case 'entitled_present':
            // TODO: Implement when available
        }

        return null;
    });

    public castedBallots = computed<number | null>(() => {
        return this.poll().ballot_ids.length;
    });

    public entitledUsers = computed<number | null>(() => {
        return null;
    });

    public presentEntitledUsers = computed<number | null>(() => {
        return null;
    });
}
