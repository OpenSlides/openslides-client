import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { PollPercentBase, VoteValue, VoteValueVerbose } from 'src/app/domain/models/poll';
import { ThemeService } from 'src/app/site/services/theme.service';
import { BaseUiComponent } from 'src/app/ui/base/base-ui-component';

import { ViewBallot, ViewPoll } from '../../../../pages/polls';
import { MeetingSettingsService } from '../../../../services/meeting-settings.service';
import { VotesFilterService } from '../../services/votes-filter.service';

interface VoteAmount {
    value: VoteValue;
    name: string;
    amount: number;
    hiddenInBase: boolean;
    weightedAmount: number;
    backgroundColor: string;
}

@Component({
    selector: `os-poll-filted-votes-chart`,
    templateUrl: `./poll-filtered-votes-chart.component.html`,
    styleUrls: [`./poll-filtered-votes-chart.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PollFilteredVotesChartComponent extends BaseUiComponent implements OnInit {
    @Input()
    public poll: ViewPoll;

    public usesVoteWeight = false;
    public validAmount = 0;
    public totalAmount = 0;
    public totalAmountWeighted = 0;
    public voteAmounts: VoteAmount[] = [];

    public get filtersEnabled(): boolean {
        return this.filterService.filterStack.length > 0;
    }

    private meetingSettings: MeetingSettingsService = inject(MeetingSettingsService);
    private themeService: ThemeService = inject(ThemeService);
    private filterService: VotesFilterService = inject(VotesFilterService);
    private cd: ChangeDetectorRef = inject(ChangeDetectorRef);

    public ngOnInit(): void {
        this.subscriptions.push(this.filterService.outputObservable.subscribe(votes => this.onVotesUpdated(votes)));
    }

    private onVotesUpdated(votes: ViewBallot[]): void {
        this.voteAmounts = [];
        const voteValues: VoteValue[] = this.poll.isMethodYN ? [`Y`, `N`] : [`Y`, `N`, `A`];
        const baseVoteValues: VoteValue[] =
            this.poll.onehundred_percent_base === PollPercentBase.YN ? [`Y`, `N`] : [`Y`, `N`, `A`];
        const countedVotes = votes.filter(v => baseVoteValues.indexOf(v.value) !== -1);
        for (const i in voteValues) {
            const voteValue = voteValues[i];
            this.voteAmounts.push({
                value: voteValue,
                name: VoteValueVerbose[voteValue],
                hiddenInBase: baseVoteValues.indexOf(voteValue) === -1,
                amount: votes.reduce((acc, curr) => acc + +(curr.value === voteValue), 0),
                weightedAmount: votes.reduce((acc, curr) => acc + (curr.value === voteValue ? +curr.weight : 0), 0),
                backgroundColor: this.themeService.getPollColor(VoteValueVerbose[voteValue].toLowerCase())
            });
        }

        this.totalAmount = votes.length;
        this.totalAmountWeighted = countedVotes.reduce((acc, curr) => acc + +curr.weight, 0);
        this.validAmount = votes.reduce((acc, curr) => acc + +curr.weight, 0);

        this.usesVoteWeight =
            this.meetingSettings.instant(`users_enable_vote_weight`) || this.totalAmount !== this.validAmount;

        this.cd.markForCheck();
    }
}
