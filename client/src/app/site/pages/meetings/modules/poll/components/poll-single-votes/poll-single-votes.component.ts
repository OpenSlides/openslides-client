import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { PollState } from 'src/app/domain/models/poll';
import { MeetingUserRepositoryService } from 'src/app/gateways/repositories/meeting_user';
import { PollBallotRepositoryService } from 'src/app/gateways/repositories/polls/poll-ballot-repository.service';
import { PollOptionRepositoryService } from 'src/app/gateways/repositories/polls/poll-option-repository.service';
import { UserRepositoryService } from 'src/app/gateways/repositories/users';
import { BaseComponent } from 'src/app/site/base/base.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { ListModule } from 'src/app/ui/modules/list';
import { PipesModule } from 'src/app/ui/pipes';

import { ViewPoll } from '../../../../pages/polls';
import { BaseVoteData } from '../../base/base-poll-detail.component';
import { PollControllerService } from '../../services/poll-controller.service';
import { VotesFilterService } from '../../services/votes-filter.service';
import { VotingService } from '../../services/voting.service';
import { StructureLevel } from 'src/app/domain/models/structure-levels';

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

    public override translate = inject(TranslateService);
    public pollRepo = inject(PollControllerService);
    public votingService = inject(VotingService);
    public filter = inject(VotesFilterService);
    private options = inject(PollOptionRepositoryService);
    private meetingUserRepo = inject(MeetingUserRepositoryService);
    private userRepo = inject(UserRepositoryService);

    public constructor() {
        super();

        this.votesDataSubject = new Subject<BaseVoteData[]>();

        effect(() => {
            if (this.poll().state === PollState.Finished) {
                // TODO: This needs filling
                const user_ids = this.poll().ballots.map(ballot => {
                    const user = this.userRepo.getViewModel(ballot.represented_meeting_user_id);
                    console.log(user);
                    console.log(ballot.ballot)
                    const result = this.options.getViewModel(ballot.id)
                    console.log(result)
                    return {
                        groupIds: user?.group_ids() ?? [],
                        structureLevelIds: user?.structure_level_ids() ?? [],
                        user: user,
                        id: user?.id ?? ballot.id,
                        votes: [`b (Test structure level b)`]
                    };
                });
                console.log(user_ids)
                this.votesDataSubject.next(user_ids);
            } else {
                this.votesDataSubject.next([]);
            }
        });

        this.votesDataObservable = this.votesDataSubject;
    }

    public printShit(): void {
        // console.log(`poll()`, this.poll());
        // console.log(`getContentObject`, this.poll().getContentObject());
        const bal = this.poll()?.ballots;
        if (bal) {
            // console.log(`poll`, bal);
            // console.log(`getModel`, bal.getModel());
            // console.log(`id`, bal.id);
            // console.log(`represented meeting user`, bal.represented_meeting_user_id);
            // console.log(bal.map(b => b.represented_meeting_user_id));
            //  console.log(`user`, bal.user);
            // console.log(`structure level`, bal?.structureLevelIds);
            //  console.log(`acting_meeting_user_id`, bal.acting_meeting_user_id);
        }
        // console.log(`resul`, this.poll().result);

        // const opption = this.options.getViewModel(this.poll()?.option_ids[0]);
        // console.log(`Options`, opption);
        // console.log(`Options`, opption.id);
        // console.log(`Options`, opption.getTitle());
        // console.log(`Options`, opption.getOptionTitle());
        // console.log(`Options`, opption.meeting_user);
        // console.log(`Options`, opption.meeting_user.user.short_name);
    }
}
