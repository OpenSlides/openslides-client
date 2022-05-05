import { Component, Input, OnInit } from '@angular/core';
import { PollData } from 'src/app/domain/models/poll/generic-poll';
import {
    PollState,
    PollMethod,
    PollTableData,
    PollPercentBase,
    VotingResult
} from 'src/app/domain/models/poll/poll-constants';
import { Permission } from 'src/app/domain/definitions/permission';
import { OperatorService } from 'src/app/site/services/operator.service';
import { AssignmentPollService } from '../../services/assignment-poll.service';

@Component({
    selector: 'os-assignment-poll-detail-content',
    templateUrl: './assignment-poll-detail-content.component.html',
    styleUrls: ['./assignment-poll-detail-content.component.scss']
})
export class AssignmentPollDetailContentComponent {
    @Input()
    public poll: PollData | null = null;

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

    public get tableData(): PollTableData[] {
        return this.pollService.generateTableData(this.poll!);
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

    public constructor(private pollService: AssignmentPollService, private operator: OperatorService) {}

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
}
