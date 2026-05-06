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
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { CustomIconComponent } from 'src/app/ui/modules/custom-icon';
import { CustomIcon } from 'src/app/ui/modules/custom-icon/definitions';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewBallot, ViewPoll, ViewPollOption } from '../../../../pages/polls';
import { ViewUser } from '../../../../view-models/view-user';
import { PollVoteOptionComponent } from '../poll-vote-option/poll-vote-option.component';

@Component({
    selector: 'os-poll-vote-selection',
    imports: [
        CustomIconComponent,
        PollVoteOptionComponent,
        NgTemplateOutlet,
        MatIconModule,
        MatButtonModule,
        TranslatePipe
    ],
    templateUrl: './poll-vote-selection.component.html',
    styleUrl: './poll-vote-selection.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PollVoteSelectionComponent implements OnDestroy {
    public readonly drawnCross = CustomIcon.DRAWN_CROSS;

    public poll = input.required<ViewPoll>();
    public user = input.required<ViewUser>();
    public loading = input<boolean>(false);

    public voted = output<unknown>();

    public ballots = signal<ViewBallot[]>([]);
    public selectedOptionIds = signal<Set<number>>(new Set());

    public isSingleSelect = computed(() => {
        const config = this.poll().config;
        return (config?.max_options_amount ?? 1) === 1;
    });

    public options = computed<ViewPollOption[]>(() => {
        return (this.poll().options ?? []).sort((a, b) => (a.weight ?? 0) - (b.weight ?? 0));
    });

    public availableVotes = computed<number>(() => {
        const config = this.poll().config;
        const maxVotes = config?.max_options_amount ?? 1;
        return maxVotes - this.selectedOptionIds().size;
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

    public isSelected(optionId: number): boolean {
        return this.selectedOptionIds().has(optionId);
    }

    public toggleOption(optionId: number): void {
        const isGeneralOption = optionId < 1;
        const selected = new Set(this.selectedOptionIds());
        if (selected.has(optionId)) {
            selected.delete(optionId);
        } else if (isGeneralOption) {
            selected.clear();
            selected.add(optionId);
        } else {
            selected.delete(0);
            selected.delete(-1);

            if (this.isSingleSelect()) {
                selected.clear();
            } else {
                const maxAmount = this.poll().config?.max_options_amount ?? 1;
                if (selected.size >= maxAmount) {
                    return;
                }
            }
            selected.add(optionId);
        }
        this.selectedOptionIds.set(selected);

        if (this.availableVotes() === 0 || isGeneralOption) {
            this.submitVote();
        }
    }

    public async submitVote(): Promise<void> {
        const selected = this.selectedOptionIds();
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
            this.voted.emit([...selected]);
        }
    }
}
