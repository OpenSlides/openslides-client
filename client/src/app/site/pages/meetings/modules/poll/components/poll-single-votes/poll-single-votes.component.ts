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

    public constructor() {
        super();

        this.votesDataSubject = new Subject<BaseVoteData[]>();

        effect(() => {
            if (this.poll().state === PollState.Finished) {
                this.votesDataSubject.next([]);
            } else {
                this.votesDataSubject.next([]);
            }
        });

        this.votesDataObservable = this.votesDataSubject;
    }

    public printShit(): void {
        console.log(this.poll());
        console.log(this.poll().getContentObject());
        console.log(this.poll().getContentObject().collection);
        console.log(this.poll().getDetailStateUrl());
        console.log(this.poll().poll);
        console.log(this.poll().result);
        console.log(this.poll().options);
        console.log(this.poll().state);
    }
}
