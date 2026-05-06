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
import { TranslatePipe } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PollRepositoryService } from 'src/app/gateways/repositories/polls/poll-repository.service';
import { CustomIconComponent } from 'src/app/ui/modules/custom-icon';
import { CustomIcon } from 'src/app/ui/modules/custom-icon/definitions';

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

    private pollRepo = inject(PollRepositoryService);
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
        const selected = new Set(this.selectedOptionIds());
        if (selected.has(optionId)) {
            selected.delete(optionId);
        } else if (optionId < 1) {
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
    }

    public submitVote(): void {
        const selected = this.selectedOptionIds();
        if (selected.size === 0) {
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
