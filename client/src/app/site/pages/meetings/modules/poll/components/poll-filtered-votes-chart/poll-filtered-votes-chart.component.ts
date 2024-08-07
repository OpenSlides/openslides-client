import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VoteValue, VoteValueVerbose } from 'src/app/domain/models/poll';
import { ThemeService } from 'src/app/site/services/theme.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { ViewVote } from '../../../../pages/polls';
import { VotesFilterService } from '../../services/votes-filter.service';

interface VoteAmount {
    value: VoteValue;
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
    public totalAmount = 0;
    public totalAmountWeighted = 0;
    public voteAmounts: VoteAmount[] = [];

    public get filtersEnabled(): boolean {
        return this.filterService.filterStack.length > 0;
    }

    public constructor(
        private themeService: ThemeService,
        private filterService: VotesFilterService,
        private cd: ChangeDetectorRef
    ) {
        super();
    }

    public ngOnInit(): void {
        this.subscriptions.push(this.filterService.outputObservable.subscribe(votes => this.onVotesUpdated(votes)));
    }

    private onVotesUpdated(votes: ViewVote[]): void {
        this.voteAmounts = [];
        const voteValues: VoteValue[] = [`Y`, `N`, `A`];
        for (const i in voteValues) {
            const voteValue = voteValues[i];
            this.voteAmounts.push({
                value: voteValue,
                amount: votes.reduce((acc, curr) => acc + +(curr.value === voteValue), 0),
                weightedAmount: votes.reduce((acc, curr) => acc + (curr.value === voteValue ? +curr.weight : 0), 0),
                backgroundColor: this.themeService.getPollColor(VoteValueVerbose[voteValue].toLowerCase())
            });
        }

        this.totalAmount = votes.length;
        this.totalAmountWeighted = votes.reduce((acc, curr) => acc + +curr.weight, 0);

        this.cd.markForCheck();
    }
}
