import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { pollChartColors, PollState, PollTableData } from 'src/app/domain/models/poll';
import { ChartData } from 'src/app/site/pages/meetings/modules/poll/components/chart/chart.component';
import { ViewPoll } from 'src/app/site/pages/meetings/pages/polls';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { TopicPollService } from '../../services/topic-poll.service';

@Component({
    selector: `os-topic-poll-detail-content`,
    template: `
        TODO
    `,
    styleUrls: [`./topic-poll-detail-content.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TopicPollDetailContentComponent extends BaseUiComponent {
    private _poll: ViewPoll;

    private _tableData: PollTableData[] = [];
    private _chartData: ChartData = null;

    @Input()
    public inSlide = false;

    public get chartData(): ChartData {
        return this._chartData;
    }

    public get tableData(): PollTableData[] {
        return this._tableData;
    }

    public get colors(): {
        backgroundColor: string[];
    } {
        return this.chartColors[0];
    }

    @Input()
    public set poll(pollData: ViewPoll) {
        this._poll = pollData;
        this.setupTableData();
        this.cd.markForCheck();
    }

    public get poll(): ViewPoll {
        return this._poll;
    }

    @Input()
    public iconSize: `large` | `gigantic` = `large`;

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
        return this.isFinished && this.poll?.published;
    }

    public get canSeeResults(): boolean {
        return this.operator.hasPerms(Permission.pollCanManage) || this.isPublished;
    }

    public readonly shouldShowChart = false;

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
        /* TODO: Update
        this.updateSubscription(
            SUBSCRIPTION_NAME,
            this.pollService.generateTableDataAsObservable(this.poll).subscribe(tableData => {
                this._tableData = tableData;
                this.setChartData();
                this.cd.markForCheck();
            })
        );
        */
    }

    private setChartData(): void {
        this._chartData = this.pollService.generateChartData(this.poll);
    }

    private generateChartColors(amount: number): { backgroundColor: string[]; hoverBackgroundColor: string[] } {
        let colors = Array.from(pollChartColors.values());
        while (colors.length < amount) {
            colors = colors.concat(Array.from(pollChartColors.values()));
        }
        while (colors.length > amount) {
            colors.pop();
        }
        return { backgroundColor: colors, hoverBackgroundColor: colors };
    }
}
