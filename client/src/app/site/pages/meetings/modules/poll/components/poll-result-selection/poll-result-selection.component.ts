import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeService } from 'src/app/site/services/theme.service';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';

import { ViewPoll, ViewPollOption } from '../../../../pages/polls';
import { PollParseNumberPipe, PollPercentBasePipe } from '../../pipes';
import { ChartComponent, ChartData } from '../chart/chart.component';

type Results = ResultRow[];
interface ResultRow {
    key: string;
    votingOption: string;
    color: string;
    amount: number;
    showPercent: boolean;
}

interface ResultsRaw {
    [key: number]: string;
    abstain: string;
    invalid: number;
}

const PollChartBarThickness = 20;

@Component({
    selector: 'os-poll-result-selection',
    imports: [IconContainerComponent, PollPercentBasePipe, PollParseNumberPipe, ChartComponent, TranslatePipe],
    templateUrl: './poll-result-selection.component.html',
    styleUrl: './poll-result-selection.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultSelectionComponent {
    public poll = input.required<ViewPoll>();

    public shouldShowEntitled = signal<boolean>(false);

    public themeService = inject(ThemeService);

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

        const rows: Results = [];
        for (const option of this.poll().options ?? []) {
            rows.push({
                key: option.fqid,
                votingOption: `${option.meeting_user_id}`,
                color: `circle`,
                amount: +results[option.id] || 0,
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
