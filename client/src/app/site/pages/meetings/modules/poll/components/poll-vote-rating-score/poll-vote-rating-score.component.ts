import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    OnDestroy,
    output,
    signal
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewPoll, ViewPollBallot, ViewPollConfigRatingScore, ViewPollOption } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';
import { PollVoteButtonComponent } from '../poll-vote-button/poll-vote-button.component';
import { PollVoteOptionComponent } from '../poll-vote-option/poll-vote-option.component';

@Component({
    selector: 'os-poll-vote-rating-score',
    imports: [
        PollVoteButtonComponent,
        PollVoteOptionComponent,
        NgTemplateOutlet,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        TranslatePipe
    ],
    templateUrl: './poll-vote-rating-score.component.html',
    styleUrl: './poll-vote-rating-score.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteRatingScoreComponent implements OnDestroy {
    public poll = input.required<ViewPoll>();
    public user = input.required<ViewUser>();
    public loading = input<boolean>(false);

    public voted = output<unknown>();

    public ballots = signal<ViewPollBallot[]>([]);
    public selectedOptionValues = signal<Map<number, string>>(new Map());

    public isSingleSelect = computed(() => {
        return (this.config()?.max_options_amount ?? 1) === 1;
    });

    public config = computed<ViewPollConfigRatingScore | undefined>(() => {
        return this.poll().config;
    });

    public options = computed<ViewPollOption[]>(() => {
        return (this.poll().options ?? []).sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
    });

    public availableVotes = computed<number>(() => {
        if (this.selectedOptionValues().has(0) || this.selectedOptionValues().has(-1)) {
            return 0;
        }

        const maxVotes = this.config()?.max_options_amount ?? 1;
        return maxVotes - this.selectedOptionValues().size;
    });

    private translate = inject(TranslateService);
    private pollRepo = inject(PollRepositoryService);
    private promptService = inject(PromptService);

    private pollBallotSubscription: Subscription;

    public constructor() {
        effect(() => {
            if (this.pollBallotSubscription) {
                this.pollBallotSubscription.unsubscribe();
            }
            this.pollBallotSubscription = this.pollRepo
                .pollBallotsByUser(this.poll().id, this.user().getMeetingUser().id)
                .subscribe(ballots => {
                    this.ballots.set(ballots);
                });
        });
    }

    public ngOnDestroy(): void {
        if (this.pollBallotSubscription) {
            this.pollBallotSubscription.unsubscribe();
        }
    }

    public getOptionVote(optionId: number): string {
        return this.selectedOptionValues().get(optionId) || '0';
    }

    public setOptionVote(optionId: number, amount: string): void {
        const isGeneralOption = optionId < 1;
        const selected = new Map(this.selectedOptionValues());
        if (isGeneralOption) {
            selected.clear();
            selected.set(optionId, '1');
        } else if (selected.has(optionId) && +amount === 0) {
            selected.delete(optionId);
        } else {
            selected.delete(0);

            if (this.isSingleSelect()) {
                selected.clear();
            } else {
                const maxAmount = this.config()?.max_options_amount ?? 1;
                if (selected.size >= maxAmount) {
                    return;
                }
            }
            selected.set(optionId, amount);
        }
        this.selectedOptionValues.set(selected);
    }

    public async submitVote(): Promise<void> {
        const selected = this.selectedOptionValues();
        if (selected.size === 0) {
            return;
        }

        const title = this.translate.instant(`Submit selection now?`);
        const content = this.translate.instant(`Your decision cannot be changed afterwards.`);

        const confirmed = await this.promptService.open(title, content);
        if (!confirmed) {
            return;
        }

        if (selected.has(0)) {
            this.voted.emit([]);
        } else if (selected.has(-1)) {
            this.voted.emit(`nota`);
        } else {
            this.voted.emit(Object.fromEntries(selected));
        }
    }
}
