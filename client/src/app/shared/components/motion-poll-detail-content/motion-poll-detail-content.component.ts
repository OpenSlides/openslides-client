import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OperatorService } from 'app/core/core-services/operator.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PollData } from 'app/shared/models/poll/generic-poll';
import { PollState } from 'app/shared/models/poll/poll-constants';
import { BaseComponent } from 'app/site/base/components/base.component';
import { MotionPollService } from 'app/site/motions/services/motion-poll.service';
import { PollTableData } from 'app/site/polls/services/poll.service';
import { Subscription } from 'rxjs';

import { ChartData } from '../charts/charts.component';

@Component({
    selector: `os-motion-poll-detail-content`,
    templateUrl: `./motion-poll-detail-content.component.html`,
    styleUrls: [`./motion-poll-detail-content.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionPollDetailContentComponent extends BaseComponent implements OnDestroy {
    private _poll: PollData;

    public get chartData(): ChartData {
        return this._chartData;
    }

    public get tableData(): PollTableData[] {
        return this._tableData;
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
        return this.operator.hasPerms(this.permission.motionCanManagePolls) || this.isPublished;
    }

    public get showChart(): boolean {
        return this.pollService.showChart(this.poll);
    }

    private _tableDataSubscription: Subscription | null = null;
    private _tableData: PollTableData[] = [];
    private _chartData: ChartData = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        protected translate: TranslateService,
        private pollService: MotionPollService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService
    ) {
        super(componentServiceCollector, translate);
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.cleanup();
    }

    private setupTableData(): void {
        this.cleanup();
        this._tableDataSubscription = this.pollService.generateTableDataAsObservable(this.poll).subscribe(tableData => {
            this._tableData = tableData;
            this.setChartData();
            this.cd.markForCheck();
        });
    }

    private setChartData(): void {
        this._chartData = this.pollService.generateChartData(this.poll);
    }

    private cleanup(): void {
        if (this._tableDataSubscription) {
            this._tableDataSubscription.unsubscribe();
            this._tableDataSubscription = null;
        }
    }
}
