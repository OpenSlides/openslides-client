import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ThemeService } from 'src/app/site/services/theme.service';

import { ViewPoll } from '../../../../pages/polls';
import { ChartComponent, ChartData } from '../chart/chart.component';

const PollChartBarThickness = 20;
// const PERCENT_DECIMAL_PLACES = 3;

@Component({
    selector: 'os-poll-result-approval',
    imports: [ChartComponent],
    templateUrl: './poll-result-approval.component.html',
    styleUrl: './poll-result-approval.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollResultApprovalComponent {
    public poll = input.required<ViewPoll>();

    private themeService = inject(ThemeService);

    public chartData = computed<ChartData>(() => {
        if (!this.poll().result) {
            return [];
        }

        const results = JSON.parse(this.poll().result);
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
