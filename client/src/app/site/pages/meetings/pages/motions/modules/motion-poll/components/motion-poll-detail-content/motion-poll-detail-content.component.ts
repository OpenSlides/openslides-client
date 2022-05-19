import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, Input, OnDestroy } from '@angular/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { VOTE_UNDOCUMENTED, OptionData } from 'src/app/domain/models/poll';
import { PollData } from 'src/app/domain/models/poll/generic-poll';
import { PollState, PollTableData } from 'src/app/domain/models/poll/poll-constants';
import { ChartData } from 'src/app/site/pages/meetings/modules/poll/components/chart/chart.component';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { OperatorService } from 'src/app/site/services/operator.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { MotionPollService } from '../../services';

const CHART_DATA_SUBSCRIPTION_NAME = `chart_data_subscription`;

@Component({
    selector: `os-motion-poll-detail-content`,
    templateUrl: `./motion-poll-detail-content.component.html`,
    styleUrls: [`./motion-poll-detail-content.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionPollDetailContentComponent extends BaseUiComponent implements OnDestroy, DoCheck {
    private _poll!: PollData | null;

    private _oldOptions: OptionData[];

    public get chartData(): ChartData {
        return this._chartData!;
    }

    public get tableData(): PollTableData[] {
        return this._tableData;
    }

    @Input()
    public set poll(pollData: PollData | null) {
        this._poll = pollData;
        this._oldOptions = JSON.parse(JSON.stringify(this._poll.options));
        if (this._poll) {
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

    public get shouldShowChart(): boolean {
        return this.pollService.shouldShowChart(this.poll);
    }

    public get motionPollService(): PollService {
        return this.pollService;
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

    public ngDoCheck(): void {
        let changeDetected = false;
        const options = this._poll.options;
        if (options.length !== this._oldOptions.length) {
            changeDetected = true;
        } else {
            changeDetected = options.some((item, index) => {
                return (
                    item?.yes !== this._oldOptions[index]?.yes ||
                    item?.no !== this._oldOptions[index]?.no ||
                    item?.abstain !== this._oldOptions[index]?.abstain
                );
            });
        }

        if (changeDetected) {
            this._oldOptions = JSON.parse(JSON.stringify(options));
            this.setupTableData();
        }
    }

    private setupTableData(): void {
        this.updateSubscription(
            CHART_DATA_SUBSCRIPTION_NAME,
            this.pollService.generateTableDataAsObservable(this.poll!).subscribe(tableData => {
                this._tableData = tableData.filter(result => result.value[0].amount !== VOTE_UNDOCUMENTED);
                this.setChartData();
                this.cd.markForCheck();
            })
        );
    }

    private setChartData(): void {
        this._chartData = this.pollService
            .generateChartData(this.poll!)
            .filter(result => result.data[0] !== VOTE_UNDOCUMENTED);
    }
}
