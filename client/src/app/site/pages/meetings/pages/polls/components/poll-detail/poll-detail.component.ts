import { ChangeDetectionStrategy, Component, computed, inject, Signal, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { map, switchMap } from 'rxjs';
import { BaseComponent } from 'src/app/site/base/base.component';
import { DirectivesModule } from 'src/app/ui/directives';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';
import { PipesModule } from 'src/app/ui/pipes';

import { DetailViewModule } from '../../../../modules/meetings-component-collector/detail-view/detail-view.module';
import { ProjectorButtonModule } from '../../../../modules/meetings-component-collector/projector-button/projector-button.module';
import { PollComponent } from '../../../../modules/poll/components/poll/poll.component';
import { PollControllerService } from '../../../../modules/poll/services/poll-controller.service';
import { PollPdfService } from '../../../../modules/poll/services/poll-pdf.service';
import { VotingService } from '../../../../modules/poll/services/voting.service';
import { ViewPoll } from '../../../../pages/polls';
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
        ProjectorButtonModule,
        PollEntitledUserComponent,
        PollSingleVotesComponent,
        TranslatePipe,
        HeadBarModule,
        MatInputModule,
        MatIconModule,
        MatFormFieldModule,
        MatMenuModule,
        MatDividerModule,
        MatCheckboxModule,
        MatSelectModule,
        MatCardModule,
        MatTooltipModule,
        MatTabsModule,
        RouterLink,
        PipesModule,
        DirectivesModule
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
    private pollPdfService = inject(PollPdfService);
    public votingService = inject(VotingService);
    private activatedRoute = inject(ActivatedRoute);
    private promptService = inject(PromptService);

    public constructor() {
        super();
        super.setTitle(this.translate.instant(`Singular poll`));
        this.poll = toSignal(
            this.activatedRoute.params.pipe(
                map(params => params['id']),
                switchMap(id => this.pollRepo.getViewModelObservable(id))
            )
        );
    }

    public async exportPollResults(): Promise<void> {
        await this.pollPdfService.exportResult(this.poll());
    }

    public async deletePoll(): Promise<void> {
        const title = this.translate.instant(`Are you sure you want to delete this vote?`);
        const content = this.poll().getTitle();
        if (await this.promptService.open(title, content)) {
            await this.pollRepo.delete(this.poll());
        }
    }
}
