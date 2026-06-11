import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, switchMap } from 'rxjs';
import { BaseComponent } from 'src/app/site/base/base.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PipesModule } from 'src/app/ui/pipes';

import { ViewPoll } from '../../../../pages/polls';
import { DetailViewModule } from '../../../meetings-component-collector/detail-view/detail-view.module';
import { PollControllerService } from '../../services/poll-controller.service';
import { VotingService } from '../../services/voting.service';
import { PollComponent } from '../poll/poll.component';
import { PollEntitledUserComponent } from '../poll-entitled-users/poll-entitled-user.component';
import { PollSingleVotesComponent } from '../poll-single-votes/poll-single-votes.component';

@Component({
    selector: `os-poll-detail`,
    templateUrl: `./poll-detail.component.html`,
    styleUrls: [`./poll-detail.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        PollComponent,
        DetailViewModule,
        PollEntitledUserComponent,
        PollSingleVotesComponent,
        TranslatePipe,
        HeadBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        MatCardModule,
        MatTooltipModule,
        MatTabsModule,
        RouterLink,
        PipesModule
    ]
})
export class PollDetailComponent extends BaseComponent {
    public poll: Signal<ViewPoll>;

    public getDetailLink = computed(() => {
        return `/${this.poll().getContentObject()!.getDetailStateUrl()}`;
    });

    public filterProps = [`user.getFullName`];

    public selectedTab = signal(0);

    public override translate = inject(TranslateService);
    public pollRepo = inject(PollControllerService);
    public votingService = inject(VotingService);
    private activatedRoute = inject(ActivatedRoute);

    public constructor() {
        super();
        super.setTitle(`Singular poll`);
        this.poll = toSignal(
            this.activatedRoute.params.pipe(
                map(params => params['id']),
                switchMap(id => this.pollRepo.getViewModelObservable(id))
            )
        );
    }
}
