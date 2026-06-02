import { Component, Input } from '@angular/core';
import { PollTableData } from 'src/app/domain/models/poll';

import { ViewPoll } from '../../../../pages/polls';
import { PollService } from '../../services/poll.service';
import { ChartData } from '../chart/chart.component';

@Component({
    selector: `os-single-option-chart-table`,
    template: ``,
    styleUrls: [`./single-option-chart-table.component.scss`]
    /*
    imports: [
        TranslatePipe,
        IconContainerComponent,
        ChartComponent,
        PollKeyVerbosePipe,
        PollParseNumberPipe,
        PollPercentBasePipe,
        PollPercentBaseAltPipe
    ]
    */
})
export class SingleOptionChartTableComponent {
    private _poll: ViewPoll;

    private _tableData: PollTableData[] = [];
    private _chartData: ChartData = null;

    private _pollService: PollService = null;

    @Input()
    public shouldShowHead = true;

    @Input()
    public inSlide = false;

    @Input()
    public set tableData(tableData: PollTableData[]) {
        this._tableData = tableData;
        if (this._poll) {
            // this.setChartData();
            // this.cd.markForCheck();
        }
    }

    public get tableData(): PollTableData[] {
        return this._tableData;
    }

    @Input()
    public set pollService(pollService: PollService) {
        this._pollService = pollService;
        // this.setChartData();
        // this.cd.markForCheck();
    }

    public get pollService(): PollService {
        return this._pollService;
    }

    @Input()
    public set poll(pollData: ViewPoll) {
        this._poll = pollData;
        // this.setChartData();
        // this.cd.markForCheck();
    }

    public get poll(): ViewPoll {
        return this._poll;
    }

    @Input()
    public iconSize: `medium` | `large` | `gigantic` = `large`;

    @Input()
    public shouldShowEntitled = false;

    @Input()
    public shouldShowEntitledPresent = false;

    @Input()
    public title = ``;

    public get chartData(): ChartData {
        return this._chartData;
    }

    /*
    public get isMethodY(): boolean {
        return this.method === PollMethod.Y;
    }

    public get isMethodN(): boolean {
        return this.method === PollMethod.N;
    }

    public get isMethodYN(): boolean {
        return this.method === PollMethod.YN;
    }

    public get isMethodYNA(): boolean {
        return this.method === PollMethod.YNA;
    }

    public get textSizeClass(): string {
        return `text-` + this.iconSize;
    }

    public get shouldShowChart(): boolean {
        return !this.tableData.some(option => option.value[0].amount < 0);
    }

    public get entitledUsersPresentCount(): number {
        return this.poll.entitled_users_at_stop?.filter(x => x.present).length || 0;
    }

    public constructor(
        private cd: ChangeDetectorRef,
        private defaultPollService: PollService,
        private themeService: ThemeService
    ) {
        this.themeService.currentGeneralColorsSubject.subscribe(_ => {
            if (this.tableData) {
                this.setChartData();
            }
        });
    }

    private setChartData(): void {
        if (!this._pollService) {
            return;
        }

        this._chartData = this.pollService.generateChartData(this.poll).filter(option => option.data[0] > 0);
    }

    public getVoteClass(votingResult: VotingResult): string {
        const votingClass = votingResult.vote as string;
        if (this.isMethodN && votingClass === `no`) {
            return `yes`;
        } else {
            return votingClass;
        }
    }

    public filterRelevantResults(votingResult: VotingResult[]): VotingResult[] {
        return votingResult.filter(result => result && this.voteFitsMethod(result));
    }

    public voteFitsMethod(result: VotingResult): boolean {
        if (!result.vote) {
            return true;
        }
        if (this.isMethodY) {
            return result.vote === `yes`;
        } else if (this.isMethodN) {
            return result.vote === `no`;
        } else if (this.isMethodYN) {
            return result.vote !== `abstain`;
        } else {
            return true;
        }
    }

    public getVoteAmount(amount: number, row: PollTableData): number {
        amount = amount ?? 0;
        if (this.isMethodN && [`user`, `list`].includes(row.class)) {
            if (amount < 0) {
                return amount;
            } else {
                return this.poll!.votesvalid - amount;
            }
        } else {
            return amount;
        }
    }
    */
}
