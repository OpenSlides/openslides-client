import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { PollPercentBase, VoteValue, VoteValueVerbose } from 'src/app/domain/models/poll';
import { ThemeService } from 'src/app/site/services/theme.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { ViewPoll, ViewVote } from '../../../../pages/polls';
import { VotesFilterService } from '../../services/votes-filter.service';

interface VoteAmount {
    value: VoteValue;
    name: string;
    amount: number;
    weightedAmount: number;
    backgroundColor: string;
}

@Component({
    selector: `os-poll-filted-votes-chart`,
    templateUrl: `./poll-filtered-votes-chart.component.html`,
    styleUrls: [`./poll-filtered-votes-chart.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollFilteredVotesChartComponent extends BaseUiComponent implements OnInit {
    @Input()
    public poll: ViewPoll;

    public totalAmount = 0;
    public totalAmountWeighted = 0;
    public voteAmounts: VoteAmount[] = [];

    public get filtersEnabled(): boolean {
        return this.filterService.filterStack.length > 0;
    }

    private themeService: ThemeService = inject(ThemeService);
    private filterService: VotesFilterService = inject(VotesFilterService);
    private cd: ChangeDetectorRef = inject(ChangeDetectorRef);

    public ngOnInit(): void {
        this.subscriptions.push(this.filterService.outputObservable.subscribe(votes => this.onVotesUpdated(votes)));
    }

    private onVotesUpdated(votes: ViewVote[]): void {
        this.voteAmounts = [];
        const voteValues: VoteValue[] =
            this.poll.onehundred_percent_base === PollPercentBase.YN ? [`Y`, `N`] : [`Y`, `N`, `A`];
        for (const i in voteValues) {
            const voteValue = voteValues[i];
            this.voteAmounts.push({
                value: voteValue,
                name: VoteValueVerbose[voteValue],
                amount: votes.reduce((acc, curr) => acc + +(curr.value === voteValue), 0),
                weightedAmount: votes.reduce((acc, curr) => acc + (curr.value === voteValue ? +curr.weight : 0), 0),
                backgroundColor: this.themeService.getPollColor(VoteValueVerbose[voteValue].toLowerCase())
            });
        }

        const countedVotes = votes.filter(v => voteValues.indexOf(v.value) !== -1);
        this.totalAmount = countedVotes.length;
        this.totalAmountWeighted = countedVotes.reduce((acc, curr) => acc + +curr.weight, 0);

        this.cd.markForCheck();
    }
}
