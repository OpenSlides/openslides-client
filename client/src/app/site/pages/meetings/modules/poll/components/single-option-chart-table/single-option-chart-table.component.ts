import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { PollData, PollMethod, PollTableData, VotingResult } from 'src/app/domain/models/poll';

import { PollService } from '../../services/poll.service';
import { ChartData } from '../chart/chart.component';

@Component({
    selector: `os-single-option-chart-table`,
    templateUrl: `./single-option-chart-table.component.html`,
    styleUrls: [`./single-option-chart-table.component.scss`]
})
export class SingleOptionChartTableComponent {
    private _poll: PollData;

    private _tableData: PollTableData[] = [];
    private _chartData: ChartData = null;

    private _pollService: PollService = null;

    @Input()
    public shouldShowHead: boolean = true;

    @Input()
    public set tableData(tableData: PollTableData[]) {
        this._tableData = tableData;
        if (this._poll) {
            this.setChartData();
            this.cd.markForCheck();
        }
    }

    @Input()
    public set pollService(pollService: PollService) {
        this._pollService = pollService;
        this.setChartData();
        this.cd.markForCheck();
    }

    @Input()
    public set poll(pollData: PollData) {
        this._poll = pollData;
        this.setChartData();
        this.cd.markForCheck();
    }

    private get method(): string | null {
        return this.poll?.pollmethod || null;
    }

    @Input()
    public iconSize: 'large' | 'gigantic' = `large`;

    @Input()
    public shouldShowEntitled: boolean = false;

    public get pollService() {
        return this._pollService || this.defaultPollService;
    }

    public get poll(): PollData {
        return this._poll;
    }

    public get chartData(): ChartData {
        return this._chartData;
    }

    public get tableData(): PollTableData[] {
        return this._tableData;
    }

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

    public constructor(private cd: ChangeDetectorRef, private defaultPollService: PollService) {}

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
}
