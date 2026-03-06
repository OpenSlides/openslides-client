import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from 'src/app/site/services/theme.service';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';

import { ViewPoll } from '../../../../pages/polls';
import { PollKeyVerbosePipe, PollParseNumberPipe, PollPercentBasePipe } from '../../pipes';
import { ChartComponent, ChartData } from '../chart/chart.component';

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
export class PollResultApprovalComponent {
    public poll = input.required<ViewPoll>();

    private themeService = inject(ThemeService);

    public shouldShowEntitled = signal<boolean>(false);

    public results = computed<ResultsRaw>(() => {
        if (!this.poll().result) {
            return [];
        }

        return JSON.parse(this.poll().result);
    });

    public options = computed<Results>(() => {
        const results = this.results();
        if (!results) {
            return [];
        }

        const rows = [
            {
                key: `Y`,
                votingOption: `yes`,
                icon: `check_circle`,
                amount: +results.yes || 0,
                showPercent: false
            },
            {
                key: `N`,
                votingOption: `no`,
                icon: `cancel`,
                amount: +results.no || 0,
                showPercent: false
            }
        ];

        if (this.poll().config.allow_abstain) {
            rows.push({
                key: `A`,
                votingOption: `abstain`,
                icon: `circle`,
                amount: +results.abstain || 0,
                showPercent: false
            });
        }

        return rows;
    });

    public chartData = computed<ChartData>(() => {
        const results = this.results();
        if (!results) {
            return [];
        }

        return Object.keys(results).map(key => {
            return {
                data: [+results[key]],
                label: key,
                backgroundColor: this.themeService.getPollColor(key),
                hoverBackgroundColor: this.themeService.getPollColor(key),
                barThickness: PollChartBarThickness,
                maxBarThickness: PollChartBarThickness
            };
        });
    });
}
