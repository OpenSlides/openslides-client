import { AsyncPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { PollState } from 'src/app/domain/models/poll';
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
        NgClass,
        AsyncPipe,
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

    public pollContentCollection = ``;
    public totalCount = 0;
    public voteCSS = ``;
    public voteIcon = ``;

    public override translate = inject(TranslateService);
    public pollRepo = inject(PollControllerService);
    public votingService = inject(VotingService);
    public filter = inject(VotesFilterService);
    private userRepo = inject(UserRepositoryService);

    public constructor() {
        super();

        this.votesDataSubject = new Subject<BaseVoteData[]>();

        effect(() => {
            if (this.poll().state === PollState.Finished) {
                this.pollContentCollection = this.poll().getContentObject().collection;
                let user_ids: BaseVoteData[];
                if (this.pollContentCollection === `assignment`) {
                    user_ids = this.poll().ballots.map(ballot => {
                        const user = this.userRepo.getViewModel(ballot.represented_meeting_user_id);
                        return {
                            user: user,
                            id: user?.id ?? ballot.id
                        };
                    });
                } else {
                    // TODO: This needs filling
                    user_ids = [];
                    // this.voteCSS;
                    // this.voteIcon;
                    // this.parent.voteOptionStyle[voteValue]?.css;
                }
                console.log(user_ids);

                this.votesDataSubject.next(user_ids);
                this.totalCount = user_ids.length;
            } else {
                this.votesDataSubject.next([]);
                this.totalCount = 0;
            }
        });
        this.votesDataObservable = this.votesDataSubject;
    }
}
