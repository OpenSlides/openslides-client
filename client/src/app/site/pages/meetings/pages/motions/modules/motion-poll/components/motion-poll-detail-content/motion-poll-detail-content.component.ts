import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, OnDestroy } from '@angular/core';
import { PollData } from 'src/app/domain/models/poll/generic-poll';
import { PollState, PollTableData } from 'src/app/domain/models/poll/poll-constants';
import { Permission } from 'src/app/domain/definitions/permission';
import { MotionPollService } from '../../services';
import { OperatorService } from 'src/app/site/services/operator.service';
import { ChartData } from 'src/app/site/pages/meetings/modules/poll/components/chart/chart.component';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

const CHART_DATA_SUBSCRIPTION_NAME = `chart_data_subscription`;

@Component({
    selector: 'os-motion-poll-detail-content',
    templateUrl: './motion-poll-detail-content.component.html',
    styleUrls: ['./motion-poll-detail-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionPollDetailContentComponent extends BaseUiComponent implements OnDestroy {
    private _poll!: PollData | null;

    public get chartData(): ChartData {
        return this._chartData!;
    }

    public get tableData(): PollTableData[] {
        return this._tableData;
    }

    @Input()
    public set poll(pollData: PollData | null) {
        this._poll = pollData;
        if (pollData) {
            this.setupTableData();
            this.cd.markForCheck();
        }
    }

    public get poll(): PollData | null {
        return this._poll;
    }

    @Input()
    public iconSize: 'large' | 'gigantic' = `large`;

    private get state(): PollState | null {
        return this.poll?.state || null;
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
        return this.operator.hasPerms(Permission.motionCanManagePolls) || this.isPublished;
    }

    public get showChart(): boolean {
        return this.pollService.shouldShowChart(this.poll);
    }

    public isPercentBaseEntitled = false;

    private _tableData: PollTableData[] = [];
    private _chartData: ChartData | null = null;

    public constructor(
        private pollService: MotionPollService,
        private operator: OperatorService,
        private cd: ChangeDetectorRef
    ) {
        super();
    }

    private setupTableData(): void {
        this.updateSubscription(
            CHART_DATA_SUBSCRIPTION_NAME,
            this.pollService.generateTableDataAsObservable(this.poll!).subscribe(tableData => {
                this._tableData = tableData;
                this.setChartData();
                this.cd.markForCheck();
            })
        );
    }

    private setChartData(): void {
        this._chartData = this.pollService.generateChartData(this.poll!);
    }
}
