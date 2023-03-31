import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { combineLatestWith, map } from 'rxjs';
import { Permission } from 'src/app/domain/definitions/permission';
import { pollChartColors, pollChartGreys, PollData, PollState, PollTableData } from 'src/app/domain/models/poll';
import { ChartData } from 'src/app/site/pages/meetings/modules/poll/components/chart/chart.component';
import { OperatorService } from 'src/app/site/services/operator.service';
import { currentGeneralColorsSubject } from 'src/app/site/services/theme.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { TopicPollService } from '../../services/topic-poll.service';

const SUBSCRIPTION_NAME = `tableData`;
@Component({
    selector: `os-topic-poll-detail-content`,
    templateUrl: `./topic-poll-detail-content.component.html`,
    styleUrls: [`./topic-poll-detail-content.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicPollDetailContentComponent extends BaseUiComponent {
    private _poll: PollData;

    private _tableData: PollTableData[] = [];
    private _chartData: ChartData = null;

    public get chartData(): ChartData {
        return this._chartData;
    }

    public get tableData(): PollTableData[] {
        return this._tableData;
    }

    public get colors() {
        return this.chartColors[0];
    }

    @Input()
    public set poll(pollData: PollData) {
        this._poll = pollData;
        this.setupTableData();
        this.cd.markForCheck();
    }

    public get poll(): PollData {
        return this._poll;
    }

    @Input()
    public iconSize: 'large' | 'gigantic' = `large`;

    private get state(): PollState {
        return this.poll.state;
    }

    public get hasResults(): boolean {
        return this.isFinished || this.isPublished;
    }

    public get isFinished(): boolean {
        return this.state === PollState.Finished;
    }

    public get isPublished(): boolean {
        return this.state === PollState.Published;
    }

    public get canSeeResults(): boolean {
        return this.operator.hasPerms(Permission.pollCanManage) || this.isPublished;
    }

    public get shouldShowChart(): boolean {
        return this.pollService.shouldShowChart(this.poll);
    }

    public get chartColors(): [{ backgroundColor: string[] }] {
        return [this.generateChartColors(this.poll.options.length)];
    }

    public constructor(
        public pollService: TopicPollService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService
    ) {
        super();
    }

    private setupTableData(): void {
        this.updateSubscription(
            SUBSCRIPTION_NAME,
            this.pollService
                .generateTableDataAsObservable(this.poll)
                .pipe(
                    combineLatestWith(currentGeneralColorsSubject),
                    map(([tableData, _]) => tableData)
                )
                .subscribe(tableData => {
                    this._tableData = tableData;
                    this.setChartData();
                    this.cd.markForCheck();
                })
        );
    }

    private setChartData(): void {
        this._chartData = this.pollService.generateChartData(this.poll);
    }

    private generateChartColors(amount: number): { backgroundColor: string[]; hoverBackgroundColor: string[] } {
        let colors = Array.from(pollChartColors.values());
        while (colors.length < amount) {
            colors = colors.concat(Array.from(pollChartGreys.values()));
        }
        while (colors.length > amount) {
            colors.pop();
        }
        return { backgroundColor: colors, hoverBackgroundColor: colors };
    }
}
