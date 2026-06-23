import { ChangeDetectionStrategy, Component, computed, effect, inject, input, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { PollState } from 'src/app/domain/models/poll';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { BaseComponent } from 'src/app/site/base/base.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
import { PipesModule } from 'src/app/ui/pipes';

import { BaseVoteData } from '../../../../modules/poll/base/base-poll-detail.component';
import { VotesFilterService } from '../../../../modules/poll/services/votes-filter.service';
import { VotingService } from '../../../../modules/poll/services/voting.service';
import { ViewPoll } from '../../../../pages/polls';
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

    public votesDataSubject: Subject<BaseVoteData[]>;

    public votesDataObservable: Observable<BaseVoteData[]>;

    public voteWeightEnabled: Signal<boolean>;
    public delegationEnabled: Signal<boolean>;

    public totalCount = 0;

    public votingService = inject(VotingService);
    public filter = inject(VotesFilterService);
    private userRepo = inject(UserRepositoryService);
    private meetingSettingsService = inject(MeetingSettingsService);

    public constructor() {
        super();

        this.votesDataSubject = new Subject<BaseVoteData[]>();
        effect(() => {
            if (this.poll().state === PollState.Finished) {
                const results: BaseVoteData[] = this.poll().ballots.map(ballot => {
                    const user = this.userRepo.getViewModel(ballot.represented_meeting_user_id);
                    return {
                        user: user,
                        id: user?.id
                    };
                });

                this.votesDataSubject.next(results);
                this.totalCount = results.length;
            } else {
                this.votesDataSubject.next([]);
                this.totalCount = 0;
            }
        });

        this.votesDataObservable = this.votesDataSubject;
        this.voteWeightEnabled = toSignal(this.meetingSettingsService.get(`users_enable_vote_weight`));
        this.delegationEnabled = toSignal(this.meetingSettingsService.get(`users_enable_vote_delegations`));
    }
}
