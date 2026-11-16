import { ChangeDetectorRef, Component, inject, Input, OnInit } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { ViewPoll } from '@app/site/pages/meetings/pages/polls/view-models';
import { ThemeService } from '@app/site/services/theme.service';
import { BaseUiComponent } from '@app/ui/base/base-ui-component';
import { TranslateKeyPipe } from '@app/ui/pipes/translate-key/translate-key.pipe';
import { TranslatePipe } from '@ngx-translate/core';

import { BaseVoteData } from '../../../../pages/polls/components/poll-single-votes/poll-single-votes.component';
import { PollApprovalBallotValue } from '../../../../pages/polls/view-models/poll-ballot';
import { MeetingSettingsService } from '../../../../services/meeting-settings.service';
import { VotesFilterService } from '../../services/votes-filter.service';

interface VoteAmount {
    value: PollApprovalBallotValue;
    amount: number;
    hiddenInBase: boolean;
    weightedAmount: number;
    backgroundColor: string;
}

@Component({
    selector: `os-poll-filted-votes-chart`,
    templateUrl: `./poll-filtered-votes-chart.component.html`,
    styleUrls: [`./poll-filtered-votes-chart.component.scss`],
    imports: [MatDividerModule, TranslatePipe, TranslateKeyPipe]
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

    private onVotesUpdated(votes: BaseVoteData[]): void {
        this.voteAmounts = [];
        const voteValues: PollApprovalBallotValue[] = !this.poll.config?.allow_abstain
            ? [`yes`, `no`]
            : [`yes`, `no`, `abstain`];
        const baseVoteValues: PollApprovalBallotValue[] =
            this.poll.config?.onehundred_percent_base === `yes_no` ? [`yes`, `no`] : [`yes`, `no`, `abstain`];
        const countedVotes = votes.filter(v => baseVoteValues.indexOf(v.valueRaw as PollApprovalBallotValue) !== -1);
        for (const i in voteValues) {
            const voteValue = voteValues[i];
            this.voteAmounts.push({
                value: voteValue,
                hiddenInBase: baseVoteValues.indexOf(voteValue) === -1,
                amount: votes.reduce((acc, curr) => acc + +(curr.valueRaw === voteValue), 0),
                weightedAmount: votes.reduce(
                    (acc, curr) => acc + (curr.valueRaw === voteValue ? +(curr.weight ?? 1) : 0),
                    0
                ),
                backgroundColor: this.themeService.getPollColor(voteValue)
            });
        }

        this.totalAmount = votes.length;
        this.totalAmountWeighted = countedVotes.reduce((acc, curr) => acc + +(curr.weight ?? 1), 0);
        this.validAmount = votes.reduce((acc, curr) => acc + +(curr.weight ?? 1), 0);

        this.usesVoteWeight =
            this.meetingSettings.instant(`users_enable_vote_weight`) || this.totalAmount !== this.validAmount;

        this.cd.markForCheck();
    }
}
