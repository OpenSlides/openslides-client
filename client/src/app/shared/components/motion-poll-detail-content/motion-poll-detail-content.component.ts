import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';

import { Subscription } from 'rxjs';

import { OperatorService } from 'app/core/core-services/operator.service';
import { ComponentServiceCollector } from 'app/core/ui-services/component-service-collector';
import { PollData } from 'app/shared/models/poll/generic-poll';
import { PollState } from 'app/shared/models/poll/poll-constants';
import { BaseComponent } from 'app/site/base/components/base.component';
import { MotionPollService } from 'app/site/motions/services/motion-poll.service';
import { PollTableData } from 'app/site/polls/services/poll.service';
import { ChartData } from '../charts/charts.component';

@Component({
    selector: 'os-motion-poll-detail-content',
    templateUrl: './motion-poll-detail-content.component.html',
    styleUrls: ['./motion-poll-detail-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MotionPollDetailContentComponent extends BaseComponent implements OnDestroy {
    private _poll: PollData;

    public chartData: ChartData;
    public tableData: PollTableData[];

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
    public iconSize: 'large' | 'gigantic' = 'large';

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

    private tableDataSubscription: Subscription | null = null;

    public constructor(
        componentServiceCollector: ComponentServiceCollector,
        private pollService: MotionPollService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService
    ) {
        super(componentServiceCollector);
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
        this.cleanup();
    }

    private setupTableData(): void {
        this.cleanup();
        this.tableDataSubscription = this.pollService.generateTableDataAsObservable(this.poll).subscribe(tableData => {
            this.tableData = tableData;
            this.setChartData();
            this.cd.markForCheck();
        });
    }

    private setChartData(): void {
        this.chartData = this.pollService.generateChartData(this.poll);
    }

    private cleanup(): void {
        if (this.tableDataSubscription) {
            this.tableDataSubscription.unsubscribe();
            this.tableDataSubscription = null;
        }
    }
}
