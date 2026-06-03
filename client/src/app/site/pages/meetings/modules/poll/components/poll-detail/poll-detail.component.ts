import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { BaseComponent } from 'src/app/site/base/base.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { IconContainerComponent } from 'src/app/ui/modules/icon-container';
import { PipesModule } from 'src/app/ui/pipes';

import { ViewPoll } from '../../../../pages/polls';
import { PollControllerService } from '../../services/poll-controller.service';
import { VotingService } from '../../services/voting.service';
import { PollComponent } from '../poll/poll.component';

@Component({
    selector: `os-poll-detail`,
    templateUrl: `./poll-detail.component.html`,
    styleUrls: [`../poll/poll.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        PollComponent,
        IconContainerComponent,
        TranslatePipe,
        HeadBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        MatCardModule,
        MatTooltipModule,
        RouterLink,
        PipesModule
    ]
})
export class PollDetailComponent extends BaseComponent {
    public poll: Signal<ViewPoll>;

    public getDetailLink = computed(() => {
        return `/${this.poll().getDetailStateUrl()}`;
    });

    public override translate = inject(TranslateService);
    public pollRepo = inject(PollControllerService);
    public votingService = inject(VotingService);
    private activatedRoute = inject(ActivatedRoute);

    public constructor() {
        super();
        super.setTitle(`Singular poll`);
        this.poll = toSignal(
            this.pollRepo.getViewModelObservable(toSignal(this.activatedRoute.params.pipe(map(p => p['id'])))())
        );
    }
}
