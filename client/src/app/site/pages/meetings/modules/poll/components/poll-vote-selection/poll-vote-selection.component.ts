import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PromptService } from 'src/app/ui/modules/prompt-dialog';

import { ViewPollBallot, ViewPollConfigSelection } from '../../../../pages/polls';
import { PollVoteBaseComponent } from '../poll-vote-base.component';
import { PollVoteButtonComponent } from '../poll-vote-button/poll-vote-button.component';
import { PollVoteOptionComponent } from '../poll-vote-option/poll-vote-option.component';

@Component({
    selector: 'os-poll-vote-selection',
    imports: [
        PollVoteButtonComponent,
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
export class PollVoteSelectionComponent extends PollVoteBaseComponent<ViewPollConfigSelection> {
    public ballots = signal<ViewPollBallot[]>([]);
    public selectedOptionIds = signal<Set<number>>(new Set());

    public isSingleSelect = computed(() => {
        return (this.config()?.max_options_amount ?? 1) === 1;
    });

    public availableVotes = computed<number>(() => {
        if (this.selectedOptionIds().has(0) || this.selectedOptionIds().has(-1)) {
            return 0;
        }

        const maxVotes = this.config()?.max_options_amount ?? 1;
        return maxVotes - this.selectedOptionIds().size;
    });

    private translate = inject(TranslateService);
    private promptService = inject(PromptService);

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
                const maxAmount = this.config()?.max_options_amount ?? 1;
                if (selected.size >= maxAmount) {
                    return;
                }
            }
            selected.add(optionId);
        }
        this.selectedOptionIds.set(selected);

        if (this.availableVotes() === 0) {
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
