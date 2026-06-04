import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BaseComponent } from 'src/app/site/base/base.component';
import { HeadBarModule } from 'src/app/ui/modules/head-bar';
import { PipesModule } from 'src/app/ui/pipes';

import { ViewPoll } from '../../../../pages/polls';
import { PollControllerService } from '../../services/poll-controller.service';
import { VotingService } from '../../services/voting.service';

@Component({
    selector: `os-poll-entitled-user`,
    templateUrl: `./poll-entitled-user.component.html`,
    styleUrls: [`./poll-entitled-user.component.scss`],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
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
export class PollEntitledUserComponent extends BaseComponent {
    public poll = input.required<ViewPoll>();

    public getDetailLink = computed(() => {
        return `/${this.poll().getDetailStateUrl()}`;
    });

    public filterProps = [`user.getFullName`];

    public selectedTab = signal(0);

    public override translate = inject(TranslateService);
    public pollRepo = inject(PollControllerService);
    public votingService = inject(VotingService);

    public printShit(): void {
        console.log(this.poll());
        console.log(this.poll().getContentObject());
        console.log(this.poll().getContentObject().collection);
        console.log(this.poll().getDetailStateUrl());
        console.log(this.poll().poll);
        console.log(this.poll().result);
        console.log(this.poll().options);
    }
}
