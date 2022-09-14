import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Permission } from 'src/app/domain/definitions/permission';
import { PollData } from 'src/app/domain/models/poll/generic-poll';
import {
    PollMethod,
    PollPercentBase,
    PollState,
    PollTableData,
    VotingResult
} from 'src/app/domain/models/poll/poll-constants';
import { ChartData } from 'src/app/site/pages/meetings/modules/poll/components/chart/chart.component';
import { PollService } from 'src/app/site/pages/meetings/modules/poll/services/poll.service';
import { OperatorService } from 'src/app/site/services/operator.service';

import { AssignmentPollService } from '../../services/assignment-poll.service';

@Component({
    selector: `os-assignment-poll-detail-content`,
    templateUrl: `./assignment-poll-detail-content.component.html`,
    styleUrls: [`./assignment-poll-detail-content.component.scss`]
})
export class AssignmentPollDetailContentComponent implements OnInit {
    private _poll: PollData;

    private _tableData: PollTableData[] = [];
    private _chartData: ChartData = null;

    @Input()
    public set poll(pollData: PollData) {
        this._poll = pollData;
        this.setupTableData();
        this.cd.markForCheck();
    }

    @Input()
    public iconSize: 'large' | 'gigantic' = `large`;

    public get poll(): PollData {
        return this._poll;
    }

    public get chartData(): ChartData {
        return this._chartData;
    }

    public get tableData(): PollTableData[] {
        return this._tableData;
    }

    private get method(): string | null {
        return this.poll?.pollmethod || null;
    }

    private get state(): PollState | null {
        return this.poll?.state || null;
    }

    public get showYHeader(): boolean {
        return this.isMethodY || this.isMethodYN || this.isMethodYNA;
    }

    public get showNHeader(): boolean {
        return this.isMethodN || this.isMethodYN || this.isMethodYNA;
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

    public get isFinished(): boolean {
        return this.state === PollState.Finished;
    }

    public get isPublished(): boolean {
        return this.state === PollState.Published;
    }

    public get shouldShowChart(): boolean {
        const validOptions = this.poll.options.some(
            option => option.yes! >= 0 && option.no! >= 0 && option.abstain! >= 0
        );
        return this.poll.options.length === 1 && this.chartData.length > 0 && validOptions;
    }

    public get hasResults(): boolean {
        return this.isFinished || this.isPublished;
    }

    public get canSeeResults(): boolean {
        return this.operator.hasPerms(Permission.assignmentCanManage) || this.isPublished;
    }

    public get isPercentBaseEntitled(): boolean {
        return this.poll?.onehundred_percent_base === PollPercentBase.Entitled;
    }

    public get assignmentPollService(): PollService {
        return this.pollService;
    }

    public constructor(
        private pollService: AssignmentPollService,
        private cd: ChangeDetectorRef,
        private operator: OperatorService
    ) {}

    public ngOnInit(): void {
        this.poll.options_as_observable.subscribe(options => this.setupTableData());
    }

    private setupTableData(): void {
        this._tableData = this.pollService.generateTableData(this.poll);
        this.setChartData();
        this.cd.markForCheck();
    }

    private setChartData(): void {
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

    public getVoteAmount(vote: VotingResult, row: PollTableData): number {
        vote.amount = vote.amount ?? 0;
        if (this.isMethodN && row.class === `user`) {
            if (vote.amount < 0) {
                return vote.amount;
            } else {
                return this.poll!.votesvalid - vote.amount;
            }
        } else {
            return vote.amount;
        }
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

    public getReformedTableData(): PollTableData[] {
        const tableData = [];
        this.tableData.forEach(tableDate => {
            if (tableDate.class === `user`) {
                tableDate.value.forEach(value => {
                    if (this.voteFitsMethod(value)) {
                        tableData.push({
                            class: tableDate.class,
                            votingOption: value.vote,
                            value: [value]
                        });
                    }
                });
            } else {
                tableData.push(tableDate);
            }
        });
        return tableData;
    }
}
