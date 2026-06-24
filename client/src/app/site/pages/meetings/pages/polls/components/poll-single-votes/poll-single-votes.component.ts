import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { map, Observable, of, switchMap, tap } from 'rxjs';
import { PollState } from 'src/app/domain/models/poll';
import { BaseComponent } from 'src/app/site/base/base.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
import { PipesModule } from 'src/app/ui/pipes';

import { BaseVoteData } from '../../../../modules/poll/base/base-poll-detail.component';
import { VotesFilterService } from '../../../../modules/poll/services/votes-filter.service';
import { VotingService } from '../../../../modules/poll/services/voting.service';
import { ViewPoll, ViewPollBallot } from '../../../../pages/polls';
import { MeetingSettingsService } from '../../../../services/meeting-settings.service';

@Component({
    selector: `os-poll-single-votes`,
    templateUrl: `./poll-single-votes.component.html`,
    styleUrls: [`./poll-single-votes.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        TranslatePipe,
        DirectivesModule,
        ListModule,
        HeadBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        MatCardModule,
        MatTooltipModule,
        MatIconModule,
        MatTabsModule,
        PipesModule
    ]
})
export class PollSingleVotesComponent extends BaseComponent {
    public poll = input.required<ViewPoll>();

    public getDetailLink = computed(() => {
        return `/${this.poll().getDetailStateUrl()}`;
    });

    public filterProps = [`user.getFullName`];

    public selectedTab = signal(0);

    public votesData$: Observable<BaseVoteData[]> = toObservable(this.poll).pipe(
        switchMap(poll => (poll.state === PollState.Finished ? poll.ballots$ : of([]))),
        map((ballots: ViewPollBallot[]) =>
            ballots.map(ballot => {
                const user = ballot.represented_meeting_user?.user;
                return {
                    user: user,
                    id: user?.id,
                    value: ballot.value
                };
            })
        ),
        tap(ballots => (this.totalCount = ballots.length))
    );

    public totalCount = 0;

    public votingService = inject(VotingService);
    public filter = inject(VotesFilterService);
    private meetingSettingsService = inject(MeetingSettingsService);

    public voteWeightEnabled = toSignal(this.meetingSettingsService.get(`users_enable_vote_weight`));
    public delegationEnabled = toSignal(this.meetingSettingsService.get(`users_enable_vote_delegations`));
}
