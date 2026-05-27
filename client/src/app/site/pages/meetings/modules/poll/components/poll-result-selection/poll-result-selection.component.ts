import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/site/services/theme.service';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';

import { UnknownUserLabel } from '../../../../pages/assignments/modules/assignment-poll/services/assignment-poll.service';
import { SelectionPollResult, ViewPollConfigSelection } from '../../../../pages/polls';
import { PollParseNumberPipe, PollPercentBasePipe } from '../../pipes';
import { ChartComponent, ChartData } from '../chart/chart.component';
import { PollResultBaseComponent } from '../poll-result-base.component';

type Results = ResultRow[];
interface ResultRow {
    key: string;
    votingOption: string;
    color: string;
    amount: number;
    showPercent: boolean;
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
    imports: [IconContainerComponent, PollPercentBasePipe, PollParseNumberPipe, ChartComponent, TranslatePipe],
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
        const rows: Results = [];
        const colors = this.generateChartColors(this.options()?.length ?? 0);
        for (const i in this.options()) {
            const option = this.options()[i];
            const optionText = option.text
                ? option.text
                : (option.meeting_user?.user?.getName() ?? this.translate.instant(UnknownUserLabel));
            rows.push({
                key: option.fqid,
                votingOption: optionText,
                color: colors[i],
                amount: +results[option.id] || 0,
                showPercent: false
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
                    showPercent: false
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
        if (!this.config().onehundredPercentBaseNum) {
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
        if (!this.config().onehundredPercentBaseNum) {
            return null;
        }

        return this.formatResultDecimal((this.invalidBallots() / this.config().onehundredPercentBaseNum) * 100);
    });

    public castedBallots = computed<number | null>(() => {
        if (this.config().onehundred_percent_base !== `cast`) {
            return null;
        }

        return this.poll().ballot_ids.length;
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
