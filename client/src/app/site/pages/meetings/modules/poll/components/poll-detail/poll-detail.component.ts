import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { BaseComponent } from 'src/app/site/base/base.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PipesModule } from 'src/app/ui/pipes';

import { ViewPoll } from '../../../../pages/polls';
import { PollControllerService } from '../../services/poll-controller.service';
import { VotingService } from '../../services/voting.service';
import { PollComponent } from '../poll/poll.component';

@Component({
    selector: `os-poll-detail`,
    templateUrl: `./poll-detail.component.html`,
    styleUrls: [`./poll-detail.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        PollComponent,
        HeadBarModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatSelectModule,
        MatCardModule,
        PipesModule
    ]
})
export class PollDetailComponent extends BaseComponent {
    public poll: Signal<ViewPoll>;

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
